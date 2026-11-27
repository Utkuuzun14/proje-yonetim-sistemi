'use strict';
/**
 * Kart #67 — Rapor doğruluk testleri (Sprint 6)
 *
 * Rapor API'sinden (#65, Mustafa) ÖNCE, #62/#143'teki kabul planına (R-01 – R-07) ve 14 Kasım
 * kapsam kararına (3 rapor türü) göre yazılmıştır. #65 birleşene kadar kırmızıdır.
 *
 * Hesabı elle bilinen sabit veri seti doğrudan VT'ye yazılır (tarih ve durum geçmişi tam
 * denetlensin diye); raporun bu veriden beklenen sonucu üretip üretmediği sınanır.
 *
 * Sözleşme önerisi (api-sozlesmesi.md'de henüz "periodic" var; #65'te netleşince yalnız
 * aşağıdaki URL ve ALAN eşlemesi güncellenir, testlerin geri kalanı değişmez):
 *
 *  GET /api/projects/:id/reports/progress
 *    { data: { total, status_counts: { 'To Do', 'In Progress', 'Done' }, overdue, completion_rate,
 *              unassigned, members: [{ user_id, name, assigned, todo, in_progress, done, overdue,
 *              completion_rate }] } }
 *  GET /api/projects/:id/reports/range?from=YYYY-AA-GG&to=YYYY-AA-GG
 *    { data: { from, to, created, completed } }
 *
 * Tanımlar (#143 ile aynı):
 *  - completion_rate = done / total * 100 (yüzde; görev yoksa 0, NaN/null değil).
 *  - Geciken: end_date < bugün VE durum Done değil. end_date'i olmayan görev gecikmez.
 *    Testin koşulduğu güne bağlı kalmamak için tarihler uzak geçmiş (2026-01-15) / uzak gelecek (2031-01-15).
 *  - Tarih aralığı iki ucu dahil, gün bazında. created: created_at bu aralıkta olan görevler;
 *    completed: aralıkta Done'a geçişi (task_status_history.new_status = 'Done') olan farklı görevler.
 *  - Proje görünürlüğü diğer modüllerle aynı: üye olmayan 403/404 alır, veri sızmaz; Yönetici tümünü görür.
 */
const request = require('supertest');
const { createApp } = require('../../src/app');
const { pool } = require('../../src/db/pool');

const app = createApp();
const auth = (token) => ({ Authorization: `Bearer ${token}` });
const uniq = (p) => `${p}.${Date.now()}.${Math.random().toString(36).slice(2, 6)}@sektech.com`;

// --- Sözleşme eşlemesi: #65'teki gerçek adlarla burası güncellenir ---------------------------
const YOL = {
  progress: (id) => `/api/projects/${id}/reports/progress`,
  range: (id, q = '') => `/api/projects/${id}/reports/range${q}`,
};
const ALAN = {
  total: (d) => d.total,
  statusCounts: (d) => d.status_counts,
  overdue: (d) => d.overdue,
  rate: (d) => d.completion_rate,
  unassigned: (d) => d.unassigned,
  members: (d) => d.members,
  memberId: (m) => m.user_id,
  created: (d) => d.created,
  completed: (d) => d.completed,
};
// -------------------------------------------------------------------------------------------

const PAST = '2026-01-15';
const FUTURE = '2031-01-15';

async function login(email, password = 'Password123!') {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return { token: res.body.data.token, user: res.body.data.user };
}

// Uç noktanın kendisi yokken dönen 404'ü kabul etmez (yoksa #65 yokken yetki testleri yanlışlıkla geçer)
function expectDenied(res) {
  expect([403, 404]).toContain(res.status);
  expect(res.body.error.message).not.toMatch(/^Uç nokta bulunamadı/);
  expect(res.body).not.toHaveProperty('data');
}
function expectValidation(res) {
  expect(res.status).toBe(400);
  expect(res.body.error.code).toBe('VALIDATION_ERROR');
}
async function getOk(url, token) {
  const res = await request(app).get(url).set(auth(token));
  expect(res.status).toBe(200);
  return res.body.data;
}
const memberRow = (data, userId) => ALAN.members(data).find((m) => ALAN.memberId(m) === userId);

async function createProject(token, name) {
  const p = await request(app)
    .post('/api/projects')
    .set(auth(token))
    .send({ name: `${name} ${Date.now()}`, start_date: '2026-01-01', end_date: '2031-12-31' })
    .expect(201);
  return p.body.data.id;
}
async function addMember(token, projectId, userId) {
  await request(app).post(`/api/projects/${projectId}/members`).set(auth(token)).send({ userId }).expect(201);
}

/**
 * Görevi VT'ye doğrudan yazar; `done` tarihi verilirse To Do → In Progress → Done geçmişini o
 * güne (öğlen, saat dilimi kaymasın) işler. `created` görevin oluşturulma günüdür.
 */
async function insertTask(projectId, { assignee = null, status, end = null, created = '2026-10-01', done = null, by }) {
  const { rows } = await pool.query(
    `INSERT INTO tasks (project_id, title, status, assignee_id, end_date, created_at)
     VALUES ($1, $2, $3, $4, $5, ($6::date + time '12:00')) RETURNING id`,
    [projectId, `Rapor görevi ${Math.random().toString(36).slice(2, 7)}`, status, assignee, end, created],
  );
  const id = rows[0].id;
  if (status !== 'To Do') {
    await pool.query(
      `INSERT INTO task_status_history (task_id, old_status, new_status, changed_by_id, changed_at)
       VALUES ($1, 'To Do', 'In Progress', $2, ($3::date + time '12:00'))`,
      [id, by, created],
    );
  }
  if (status === 'Done') {
    await pool.query(
      `INSERT INTO task_status_history (task_id, old_status, new_status, changed_by_id, changed_at)
       VALUES ($1, 'In Progress', 'Done', $2, ($3::date + time '12:00'))`,
      [id, by, done],
    );
  }
  return id;
}

let admin;
let m1; // Utku — #143'teki "Üye 1"
let m2; // Mert — #143'teki "Üye 2"
let outsider;
let projectA; // #143 sabit veri seti (10 görev) — yalnız okunur
let emptyProject;

beforeAll(async () => {
  admin = await login('hakan@sektech.com');
  m1 = await login('utku@sektech.com');
  m2 = await login('mert@sektech.com');
  const email = uniq('rapor-disarida');
  await request(app).post('/api/auth/register').send({ name: 'Rapor Dışı', email, password: 'Gizli123!' }).expect(201);
  outsider = await login(email, 'Gizli123!');

  projectA = await createProject(admin.token, 'Rapor veri seti');
  await addMember(admin.token, projectA, m1.user.id);
  await addMember(admin.token, projectA, m2.user.id);
  const by = admin.user.id;
  const t = (o) => insertTask(projectA, { by, ...o });

  // Üye 1: 5 görev → 2 Done, 2 In Progress, 1 To Do · 2 geciken · %40
  await t({ assignee: m1.user.id, status: 'Done', end: PAST, created: '2026-10-20', done: '2026-10-31' }); // Done + tarihi geçmiş → gecikmez
  await t({ assignee: m1.user.id, status: 'Done', end: FUTURE, created: '2026-11-01', done: '2026-11-01' }); // aralığın ilk günü
  await t({ assignee: m1.user.id, status: 'In Progress', end: PAST, created: '2026-11-01' }); // geciken
  await t({ assignee: m1.user.id, status: 'In Progress', end: FUTURE, created: '2026-11-08' });
  await t({ assignee: m1.user.id, status: 'To Do', end: PAST, created: '2026-11-16' }); // geciken
  // Üye 2: 5 görev → 2 Done, 1 In Progress, 2 To Do · 1 geciken · %40
  await t({ assignee: m2.user.id, status: 'Done', end: FUTURE, created: '2026-10-20', done: '2026-11-15' }); // aralığın son günü
  await t({ assignee: m2.user.id, status: 'Done', end: FUTURE, created: '2026-10-20', done: '2026-11-16' }); // aralık dışı
  await t({ assignee: m2.user.id, status: 'In Progress', end: PAST, created: '2026-11-08' }); // geciken
  await t({ assignee: m2.user.id, status: 'To Do', end: FUTURE, created: '2026-11-15' });
  await t({ assignee: m2.user.id, status: 'To Do', end: null, created: '2026-11-16' }); // tarihsiz → gecikmez

  emptyProject = await createProject(admin.token, 'Rapor boş proje');
  await addMember(admin.token, emptyProject, m1.user.id);
});
afterAll(() => pool.end());

// Veri setinin kendisi doğru mu? Rapor API'sinden bağımsız, düz SQL ile (bu blok #65 yokken de geçer)
describe('Sabit veri seti (SQL ile bağımsız hesap)', () => {
  test('#143 veri seti: 4/3/3, 3 geciken; aralıkta 5 oluşturulan, 2 tamamlanan', async () => {
    const q = (sql) => pool.query(sql, [projectA]).then((r) => r.rows);
    const counts = Object.fromEntries((await q('SELECT status, COUNT(*)::int n FROM tasks WHERE project_id = $1 GROUP BY status')).map((r) => [r.status, r.n]));
    expect(counts).toEqual({ 'To Do': 3, 'In Progress': 3, Done: 4 });
    const [late] = await q("SELECT COUNT(*)::int n FROM tasks WHERE project_id = $1 AND end_date < CURRENT_DATE AND status <> 'Done'");
    expect(late.n).toBe(3);
    const [created] = await q("SELECT COUNT(*)::int n FROM tasks WHERE project_id = $1 AND created_at::date BETWEEN '2026-11-01' AND '2026-11-15'");
    expect(created.n).toBe(5);
    const [completed] = await q(
      "SELECT COUNT(DISTINCT h.task_id)::int n FROM task_status_history h JOIN tasks t ON t.id = h.task_id WHERE t.project_id = $1 AND h.new_status = 'Done' AND h.changed_at::date BETWEEN '2026-11-01' AND '2026-11-15'",
    );
    expect(completed.n).toBe(2);
  });
});

describe('Kimlik doğrulama zorunlu', () => {
  test.each([
    ['ilerleme', () => YOL.progress(1)],
    ['tarih aralığı', () => YOL.range(1, '?from=2026-11-01&to=2026-11-15')],
  ])('%s raporu token olmadan → 401', async (_ad, url) => {
    const res = await request(app).get(url());
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});

describe('1. Proje ilerleme yüzdesi', () => {
  test('R-01: 10 görev → 4 Done / 3 In Progress / 3 To Do, %40, 3 geciken', async () => {
    const data = await getOk(YOL.progress(projectA), m1.token);
    expect(ALAN.total(data)).toBe(10);
    expect(ALAN.statusCounts(data)).toEqual({ 'To Do': 3, 'In Progress': 3, Done: 4 });
    expect(ALAN.rate(data)).toBeCloseTo(40, 1);
    expect(ALAN.overdue(data)).toBe(3);
    expect(ALAN.unassigned(data)).toBe(0);
  });

  test('aynı rapor Yönetici ve iki üye için aynı (oturuma göre değişmez)', async () => {
    const [a, b, c] = await Promise.all([admin, m1, m2].map((u) => getOk(YOL.progress(projectA), u.token)));
    expect(b).toEqual(a);
    expect(c).toEqual(a);
  });

  test('R-02: görevi olmayan proje → toplam 0, %0; yanıtta NaN/Infinity/null yüzde yok', async () => {
    const res = await request(app).get(YOL.progress(emptyProject)).set(auth(m1.token));
    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(ALAN.total(data)).toBe(0);
    expect(ALAN.rate(data)).toBe(0);
    expect(ALAN.overdue(data)).toBe(0);
    expect(res.text).not.toMatch(/NaN|Infinity/);
    for (const m of ALAN.members(data)) expect(m.completion_rate).toBe(0);
  });
});

describe('2. Kişi bazlı tamamlama', () => {
  test('R-03: Üye 1 → 5 atanan / 2 biten / 2 geciken (%40)', async () => {
    const row = memberRow(await getOk(YOL.progress(projectA), admin.token), m1.user.id);
    expect(row).toMatchObject({ assigned: 5, done: 2, in_progress: 2, todo: 1, overdue: 2 });
    expect(row.completion_rate).toBeCloseTo(40, 1);
  });

  test('R-03: Üye 2 → 5 atanan / 2 biten / 1 geciken (%40); tarihsiz görev gecikmez', async () => {
    const row = memberRow(await getOk(YOL.progress(projectA), admin.token), m2.user.id);
    expect(row).toMatchObject({ assigned: 5, done: 2, in_progress: 1, todo: 2, overdue: 1 });
    expect(row.completion_rate).toBeCloseTo(40, 1);
  });

  test('kişi satırlarının toplamı proje toplamıyla tutarlı', async () => {
    const data = await getOk(YOL.progress(projectA), admin.token);
    const sum = (k) => ALAN.members(data).reduce((s, m) => s + m[k], 0);
    expect(sum('assigned') + ALAN.unassigned(data)).toBe(ALAN.total(data));
    expect(sum('overdue')).toBe(ALAN.overdue(data));
  });

  test('ad, kullanıcıya ait; şifre veya e-posta dışı kişisel alan sızmaz', async () => {
    const data = await getOk(YOL.progress(projectA), admin.token);
    expect(memberRow(data, m1.user.id).name).toBe(m1.user.name);
    expect(JSON.stringify(data)).not.toMatch(/password|hash/i);
  });
});

// Veriyi değiştiren senaryolar ayrı projede: R-01'in sabit %40'ı bozulmasın (#143, öneri 4)
describe('Canlı güncelleme ve atanmamış görev (R-04, demo adım 5.3)', () => {
  let projectB;
  let lateTask;

  beforeAll(async () => {
    projectB = await createProject(admin.token, 'Rapor değişen');
    await addMember(admin.token, projectB, m1.user.id);
    const by = admin.user.id;
    lateTask = await insertTask(projectB, { by, assignee: m1.user.id, status: 'In Progress', end: PAST });
    await insertTask(projectB, { by, assignee: m1.user.id, status: 'Done', end: FUTURE, done: '2026-11-10' });
    await insertTask(projectB, { by, assignee: null, status: 'To Do', end: FUTURE }); // atanmamış
    await insertTask(projectB, { by, assignee: m1.user.id, status: 'To Do', end: FUTURE });
  });

  test('R-04: atanmamış görev toplamda ve "atanmamış"ta sayılır, kişi satırına girmez', async () => {
    const data = await getOk(YOL.progress(projectB), admin.token);
    expect(ALAN.total(data)).toBe(4);
    expect(ALAN.unassigned(data)).toBe(1);
    expect(memberRow(data, m1.user.id).assigned).toBe(3);
    expect(ALAN.members(data).every((m) => ALAN.memberId(m) !== null)).toBe(true);
  });

  test('R-04 / 5.3: geciken görev API ile Done yapılınca rapor anında güncellenir (%25 → %50, geciken 1 → 0)', async () => {
    const before = await getOk(YOL.progress(projectB), m1.token);
    expect(ALAN.rate(before)).toBeCloseTo(25, 1);
    expect(ALAN.overdue(before)).toBe(1);

    await request(app).patch(`/api/tasks/${lateTask}`).set(auth(m1.token)).send({ status: 'Done' }).expect(200);

    const after = await getOk(YOL.progress(projectB), m1.token);
    expect(ALAN.rate(after)).toBeCloseTo(50, 1);
    expect(ALAN.overdue(after)).toBe(0);
    expect(memberRow(after, m1.user.id)).toMatchObject({ done: 2, overdue: 0 });
  });
});

describe('3. Tarih aralıklı ilerleme', () => {
  test('R-05: 2026-11-01 – 2026-11-15 → 5 oluşturulan, 2 tamamlanan (iki uç dahil)', async () => {
    const data = await getOk(YOL.range(projectA, '?from=2026-11-01&to=2026-11-15'), m1.token);
    // Oluşturulan: 11-01 ×2, 11-08 ×2, 11-15 ×1 · Tamamlanan: 11-01 ve 11-15 (10-31 ve 11-16 dışarıda)
    expect(ALAN.created(data)).toBe(5);
    expect(ALAN.completed(data)).toBe(2);
  });

  test('tek günlük aralık (from = to) → yalnız o gün', async () => {
    const data = await getOk(YOL.range(projectA, '?from=2026-11-15&to=2026-11-15'), m1.token);
    expect(ALAN.created(data)).toBe(1);
    expect(ALAN.completed(data)).toBe(1);
  });

  test('In Progress geçişleri tamamlanan sayılmaz; kayıt olmayan aralık → 0', async () => {
    const data = await getOk(YOL.range(projectA, '?from=2030-01-01&to=2030-12-31'), m1.token);
    expect(ALAN.created(data)).toBe(0);
    expect(ALAN.completed(data)).toBe(0);
  });

  test('tüm dönem → 10 oluşturulan, 4 tamamlanan', async () => {
    const data = await getOk(YOL.range(projectA, '?from=2026-01-01&to=2026-12-31'), m1.token);
    expect(ALAN.created(data)).toBe(10);
    expect(ALAN.completed(data)).toBe(4);
  });

  test.each([
    ['ters aralık (to < from)', '?from=2026-11-15&to=2026-11-01'],
    ['geçersiz tarih biçimi', '?from=15.11.2026&to=2026-11-20'],
    ['olmayan gün', '?from=2026-02-30&to=2026-03-05'],
    ['from eksik', '?to=2026-11-15'],
    ['to eksik', '?from=2026-11-01'],
  ])('R-06: %s → 400', async (_ad, q) => {
    expectValidation(await request(app).get(YOL.range(projectA, q)).set(auth(m1.token)));
  });
});

describe('Yetki ve veri izolasyonu (R-07)', () => {
  test.each([
    ['ilerleme', () => YOL.progress(projectA)],
    ['tarih aralığı', () => YOL.range(projectA, '?from=2026-11-01&to=2026-11-15')],
  ])('üye olmayan kullanıcı %s raporunu göremez → 403/404, veri yok', async (_ad, url) => {
    expectDenied(await request(app).get(url()).set(auth(outsider.token)));
  });

  test('olmayan proje → 404; geçersiz kimlik → 400', async () => {
    const missing = await request(app).get(YOL.progress(999999)).set(auth(admin.token));
    expect(missing.status).toBe(404);
    expect(missing.body.error.message).not.toMatch(/^Uç nokta bulunamadı/);
    expectValidation(await request(app).get(YOL.progress('abc')).set(auth(admin.token)));
  });
});
