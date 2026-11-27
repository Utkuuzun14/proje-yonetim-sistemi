// Temel performans ölçümü (#74, Test Raporu v1 §5.2 · TS-RPR-05).
// Seed'li bir ortama karşı koşar: geçici bir proje + görev veri seti oluşturur, uç noktaları ölçer, projeyi siler.
// Yük/stres testi değildir; tek ya da az sayıda eşzamanlı istemcinin yanıt süresini ölçer.
//
//   node scripts/perf-smoke.mjs                           # API: http://localhost:5000
//   PERF_BASE=http://localhost:3000 node scripts/perf-smoke.mjs   # nginx üzerinden
//   PERF_ITER=100 PERF_CONCURRENCY=5 PERF_TASKS=500 node scripts/perf-smoke.mjs
//   PERF_DIST=client/dist PERF_OUT=perf.json node scripts/perf-smoke.mjs
//
// Ortam değişkenleri (varsayılan): PERF_BASE (http://localhost:5000), PERF_ITER (50, uç nokta başına ölçüm),
// PERF_CONCURRENCY (1), PERF_TASKS (200, veri seti), PERF_LIMIT_MS (1000, p95 eşiği), PERF_WARMUP (5),
// PERF_EMAIL / PERF_PASSWORD (seed yöneticisi), PERF_DIST (gzip paket ölçümü için derleme klasörü),
// PERF_OUT (ham sonuçlar için JSON dosyası).
// Çıkış kodu: herhangi bir uç noktanın p95'i eşiği aşarsa veya beklenmeyen durum kodu dönerse 1.
import assert from 'node:assert/strict';
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { performance } from 'node:perf_hooks';

const env = process.env;
const BASE = (env.PERF_BASE || 'http://localhost:5000').replace(/\/$/, '');
const ITER = Number(env.PERF_ITER) || 50;
const CONC = Number(env.PERF_CONCURRENCY) || 1;
const TASKS = Number(env.PERF_TASKS) || 200;
const LIMIT = Number(env.PERF_LIMIT_MS) || 1000;
const WARMUP = Number(env.PERF_WARMUP ?? 5);
const EMAIL = env.PERF_EMAIL || 'hakan@sektech.com';
const PASSWORD = env.PERF_PASSWORD || 'Password123!';

async function call(urlPath, { token, method = 'GET', body } = {}) {
  const t0 = performance.now();
  const res = await fetch(BASE + urlPath, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(15000),
  });
  const text = await res.text(); // gövde okunana kadar süre işler
  const ms = performance.now() - t0;
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* JSON olmayan gövde */ }
  return { status: res.status, ms, json };
}

async function expectOk(urlPath, opts = {}, status = 200) {
  const r = await call(urlPath, opts);
  assert.equal(r.status, status, `${opts.method || 'GET'} ${urlPath}: ${status} bekleniyordu, ${r.status} geldi`);
  return r.json;
}

const pct = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)];
const r1 = (n) => Math.round(n * 10) / 10;

/** Bir isteği ITER kez, CONC eşzamanlı işçiyle çalıştırır. make(i) → [path, opts, beklenenDurum]. */
async function measure(name, target, make, conc = CONC) {
  for (let i = 0; i < WARMUP; i++) await call(...make(i).slice(0, 2));
  const times = [];
  const bad = [];
  let next = 0;
  const worker = async () => {
    while (next < ITER) {
      const i = next++;
      const [p, opts, status = 200] = make(i);
      const r = await call(p, opts);
      if (r.status !== status) bad.push(`${r.status}`);
      times.push(r.ms);
    }
  };
  const t0 = performance.now();
  await Promise.all(Array.from({ length: conc }, worker));
  const wall = performance.now() - t0;
  times.sort((a, b) => a - b);
  const row = {
    name, target, n: times.length,
    p50: r1(pct(times, 50)), p95: r1(pct(times, 95)), max: r1(times.at(-1)),
    mean: r1(times.reduce((a, b) => a + b, 0) / times.length),
    rps: r1(times.length / (wall / 1000)),
    errors: bad.length, errorCodes: [...new Set(bad)],
  };
  row.ok = row.errors === 0 && row.p95 < LIMIT;
  console.error(`  ${row.ok ? '✓' : '✗'} ${name}: p95 ${row.p95} ms${row.errors ? `, ${row.errors} hatalı yanıt (${row.errorCodes})` : ''}`);
  return row;
}

function bundleSize(dir) {
  const files = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(js|css|html)$/.test(e.name)) files.push(p);
    }
  };
  walk(dir);
  let raw = 0;
  let gz = 0;
  for (const f of files) {
    const buf = fs.readFileSync(f);
    raw += buf.length;
    gz += zlib.gzipSync(buf, { level: 9 }).length;
  }
  return { files: files.length, rawKB: r1(raw / 1024), gzipKB: r1(gz / 1024), ok: gz <= 2 * 1024 * 1024 };
}

// ---------------------------------------------------------------------------------------------
const startedAt = new Date();
console.error(`Performans ölçümü → ${BASE} · ${ITER} ölçüm/uç nokta · ${CONC} eşzamanlı · ${TASKS} görev`);

const health = await call('/api/health');
assert.equal(health.status, 200, `/api/health ${health.status} döndü — ortam ayakta mı?`);

const auth = (await expectOk('/api/auth/login', { method: 'POST', body: { email: EMAIL, password: PASSWORD } })).data;
const token = auth.token;
const me = auth.user;

let projectId;
const rows = [];
const notes = [];
try {
  // --- Veri seti -------------------------------------------------------------------------------
  const created = await expectOk('/api/projects', {
    method: 'POST', token,
    body: { name: `PERF ${startedAt.toISOString()}`, description: 'Geçici performans ölçümü (#74), otomatik silinir.', start_date: '2026-01-01', end_date: '2026-12-31' },
  }, 201);
  projectId = created.data.id;

  const statuses = ['To Do', 'In Progress', 'Done'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const types = ['Task', 'Bug', 'Feature'];
  const taskIds = [];
  const t0 = performance.now();
  for (let i = 0; i < TASKS; i += 10) {
    const batch = Array.from({ length: Math.min(10, TASKS - i) }, (_, k) => {
      const n = i + k;
      const month = String((n % 12) + 1).padStart(2, '0');
      return expectOk(`/api/projects/${projectId}/tasks`, {
        method: 'POST', token,
        body: {
          title: `Perf görevi ${n + 1}`,
          status: statuses[n % 3], priority: priorities[n % 4], type: types[n % 3],
          assignee_id: n % 4 === 0 ? null : me.id,
          start_date: `2026-${month}-01`, end_date: `2026-${month}-${String((n % 27) + 1).padStart(2, '0')}`,
        },
      }, 201).then((j) => taskIds.push(j.data.id));
    });
    await Promise.all(batch);
  }
  console.error(`  Veri seti: ${taskIds.length} görev ${r1((performance.now() - t0) / 1000)} sn'de oluşturuldu`);

  // --- Ölçümler --------------------------------------------------------------------------------
  const pick = (i) => taskIds[(i + taskIds.length) % taskIds.length];
  const loginBody = { email: EMAIL, password: PASSWORD };

  // Giriş her zaman tek istemciyle ölçülür: aynı IP'den eşzamanlı başarılı girişler bile rate-limit sayacını
  // doldurup 15 dk kilitliyor (bkz. Test Raporu §6). Eşzamanlı ölçüm hedef ortamı kilitler.
  rows.push(await measure('POST /api/auth/login (sıralı)', '< 1 sn', () => ['/api/auth/login', { method: 'POST', body: loginBody }], 1));
  rows.push(await measure('GET /api/auth/me', '< 1 sn', () => ['/api/auth/me', { token }]));
  rows.push(await measure('GET /api/projects', '< 1 sn', () => ['/api/projects', { token }]));
  rows.push(await measure('GET /api/projects/:id', '< 1 sn', () => [`/api/projects/${projectId}`, { token }]));
  rows.push(await measure(`GET /api/projects/:id/tasks (${taskIds.length} görev)`, '< 1 sn', () => [`/api/projects/${projectId}/tasks`, { token }]));
  rows.push(await measure('GET /api/projects/:id/tasks (durum + kişi + tarih filtresi)', '< 1 sn (FR-09)', () => [
    `/api/projects/${projectId}/tasks?status=In%20Progress&assigneeId=${me.id}&from=2026-03-01&to=2026-08-31`, { token },
  ]));
  rows.push(await measure('PATCH /api/tasks/:id (durum)', '< 1 sn', (i) => [
    `/api/tasks/${pick(i)}`, { method: 'PATCH', token, body: { status: statuses[(i + 1) % 3] } },
  ]));
  rows.push(await measure('GET /api/tasks/:id/history', '< 1 sn', (i) => [`/api/tasks/${pick(i)}/history`, { token }]));

  // Rapor uç noktaları (#65). Henüz yoksa ölçüm atlanır, rapora not düşülür.
  const reports = [
    ['GET /api/projects/:id/reports/progress', `/api/projects/${projectId}/reports/progress`],
    ['GET /api/projects/:id/reports/range', `/api/projects/${projectId}/reports/range?from=2026-01-01&to=2026-12-31`],
  ];
  for (const [name, p] of reports) {
    const probe = await call(p, { token });
    if (probe.status === 404) {
      notes.push(`${name}: uç nokta yok (404), ölçülmedi — #65 birleşince tekrar koşulacak.`);
      console.error(`  – ${name}: uç nokta yok, atlandı`);
      continue;
    }
    rows.push(await measure(name, '< 1 sn (TS-RPR-05)', () => [p, { token }]));
  }
} finally {
  if (projectId) {
    const del = await call(`/api/projects/${projectId}`, { method: 'DELETE', token });
    if (del.status !== 204) console.error(`UYARI: geçici proje ${projectId} silinemedi (${del.status}), elle silin.`);
  }
}

const bundle = env.PERF_DIST ? bundleSize(env.PERF_DIST) : null;

// --- Çıktı: Test Raporu §5.2'ye yapıştırılabilir Markdown ---------------------------------------
const cpu = os.cpus();
const conditions = {
  date: startedAt.toISOString(),
  base: BASE,
  host: `${os.type()} ${os.release()} · ${cpu.length} × ${cpu[0]?.model?.trim()} · ${r1(os.totalmem() / 2 ** 30)} GB RAM`,
  node: process.version,
  dataset: `${TASKS} görevli geçici proje + seed verisi`,
  iterations: ITER, concurrency: CONC, warmup: WARMUP, limitMs: LIMIT,
};

const lines = [
  `**Ölçüm koşulları:** ${conditions.date.slice(0, 16).replace('T', ' ')} UTC · ${conditions.base} · ${conditions.host} · Node ${conditions.node}`,
  `· veri seti: ${conditions.dataset} · ${ITER} ölçüm/uç nokta, ${WARMUP} ısınma · eşzamanlı istemci: ${CONC} · araç: \`scripts/perf-smoke.mjs\``,
  '',
  '| Uç nokta | Hedef | p50 (ms) | p95 (ms) | Maks (ms) | İstek/sn | Sonuç |',
  '|---|---|---|---|---|---|---|',
  ...rows.map((r) => `| \`${r.name}\` | ${r.target} | ${r.p50} | ${r.p95} | ${r.max} | ${r.rps} | ${r.ok ? '✅' : `❌${r.errors ? ` ${r.errors} hata` : ''}`} |`),
];
if (bundle) {
  lines.push('', '| İstemci | Hedef | Ölçülen |', '|---|---|---|',
    `| Üretim paketi (${bundle.files} dosya, gzip) | ≤ 2 MB (SRS §4.1) | ${bundle.gzipKB} KB (ham ${bundle.rawKB} KB) ${bundle.ok ? '✅' : '❌'} |`);
}
if (notes.length) lines.push('', ...notes.map((n) => `- ${n}`));
console.log(lines.join('\n'));

if (env.PERF_OUT) {
  fs.writeFileSync(env.PERF_OUT, JSON.stringify({ conditions, rows, bundle, notes }, null, 2));
  console.error(`Ham sonuçlar: ${env.PERF_OUT}`);
}

const failed = rows.filter((r) => !r.ok).length + (bundle && !bundle.ok ? 1 : 0);
console.error(failed ? `BAŞARISIZ: ${failed} ölçüm eşiği aştı veya hata döndü.` : `GEÇTİ: tüm ölçümler p95 < ${LIMIT} ms.`);
process.exit(failed ? 1 : 0);
