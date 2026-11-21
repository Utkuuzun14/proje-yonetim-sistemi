'use strict';
/**
 * Kart #46 — Rol, yetki ve proje API testleri (Sprint 3)
 *
 * Bu testler #44'teki (Mustafa) uç noktalardan ÖNCE, API sözleşmesi v0.5'e
 * (server/src/docs/openapi.yaml) ve SRS FR-03/04/05'e göre yazılmıştır; #44'ün kabul testleridir.
 * #109 (29 Ekim) ile hepsi yeşil.
 *
 * Varsayımlar (sözleşmede açık değilse docs/backend/api-sozlesmesi.md §1):
 *  - Tüm başarılı yanıtlar { data: ... } biçimindedir; POST /projects yeni projeyi döner.
 *  - Seed: hakan@sektech.com = Yönetici, utku@sektech.com = Ekip Üyesi, proje 1'in 7 üyesi var.
 */
const request = require('supertest');
const { createApp } = require('../../src/app');
const { pool } = require('../../src/db/pool');

const app = createApp();
const PASS = 'Password123!';
const uniq = (p) => `${p}.${Date.now()}.${Math.random().toString(36).slice(2, 6)}@sektech.com`;

async function login(email, password = PASS) {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return { token: res.body.data.token, user: res.body.data.user };
}
async function registerOutsider() {
  const email = uniq('disarida');
  await request(app).post('/api/auth/register').send({ name: 'Proje Dışı Üye', email, password: 'Gizli123!' }).expect(201);
  return login(email, 'Gizli123!');
}
const auth = (token) => ({ Authorization: `Bearer ${token}` });

// 404 kabul edilen yerlerde, uç noktanın kendisinin olmamasından kaynaklanan 404'ü ayırt eder
// (aksi halde #44 yokken testler yanlışlıkla geçer).
function expectDenied(res, allowed = [403, 404]) {
  expect(allowed).toContain(res.status);
  expect(res.body.error.message).not.toMatch(/^Uç nokta bulunamadı/);
  expect(res.body).not.toHaveProperty('data');
}
const projectBody = (o = {}) => ({
  name: `Test projesi ${Date.now()}`,
  description: 'RBAC testi',
  start_date: '2026-11-01',
  end_date: '2026-11-30',
  ...o,
});

let admin;
let member;
let outsider;

beforeAll(async () => {
  admin = await login('hakan@sektech.com');
  member = await login('utku@sektech.com');
  outsider = await registerOutsider();
});
afterAll(() => pool.end());

async function createProject(o) {
  const res = await request(app).post('/api/projects').set(auth(admin.token)).send(projectBody(o));
  expect(res.status).toBe(201);
  return res.body.data;
}

describe('Kimlik doğrulama zorunlu', () => {
  test.each([
    ['get', '/api/projects'],
    ['post', '/api/projects'],
    ['get', '/api/projects/1'],
    ['patch', '/api/projects/1'],
    ['delete', '/api/projects/1'],
    ['post', '/api/projects/1/members'],
  ])('%s %s token olmadan → 401', async (method, url) => {
    const res = await request(app)[method](url).send({});
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});

describe('Proje oluşturma (FR-04)', () => {
  test('TS-ROL-01 / TS-PRJ-01: Yönetici proje oluşturur → 201, sahibi kendisi', async () => {
    const res = await request(app).post('/api/projects').set(auth(admin.token)).send(projectBody({ name: 'Yönetici projesi' }));
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ name: 'Yönetici projesi', owner_id: admin.user.id });
    expect(res.body.data.id).toEqual(expect.any(Number));
  });

  test('TS-ROL-01 (ters): Ekip Üyesi proje oluşturamaz → 403', async () => {
    const res = await request(app).post('/api/projects').set(auth(member.token)).send(projectBody());
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  test('TS-PRJ-02: bitiş tarihi başlangıçtan önce → 400', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set(auth(admin.token))
      .send(projectBody({ start_date: '2026-12-01', end_date: '2026-11-01' }));
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('ad eksik → 400 ve alan hatası', async () => {
    const res = await request(app).post('/api/projects').set(auth(admin.token)).send(projectBody({ name: '' }));
    expect(res.status).toBe(400);
    expect(res.body.error.details.map((d) => d.field)).toContain('name');
  });
});

describe('Proje görünürlüğü (FR-03 madde 3)', () => {
  test('Ekip Üyesi yalnız üyesi olduğu projeleri listeler', async () => {
    const secret = await createProject({ name: 'Üyesi olmadığı proje' });
    const res = await request(app).get('/api/projects').set(auth(member.token));
    expect(res.status).toBe(200);
    const ids = res.body.data.map((p) => p.id);
    expect(ids).toContain(1); // seed: Utku proje 1'in üyesi
    expect(ids).not.toContain(secret.id);
  });

  test('Yönetici tüm projeleri görür', async () => {
    const p = await createProject();
    const res = await request(app).get('/api/projects').set(auth(admin.token));
    expect(res.status).toBe(200);
    expect(res.body.data.map((x) => x.id)).toEqual(expect.arrayContaining([1, p.id]));
  });

  test('TS-ROL-04: üye olmayan proje detayını göremez → 403 veya 404, veri sızmaz', async () => {
    const res = await request(app).get('/api/projects/1').set(auth(outsider.token));
    expectDenied(res);
  });

  test('üye proje detayını görür (üyeler dahil)', async () => {
    const res = await request(app).get('/api/projects/1').set(auth(member.token));
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ id: 1 });
  });

  test('olmayan proje → 404', async () => {
    const res = await request(app).get('/api/projects/999999').set(auth(admin.token));
    expectDenied(res, [404]);
  });
});

describe('Proje güncelleme ve silme', () => {
  test('Yönetici projeyi günceller → 200', async () => {
    const p = await createProject();
    const res = await request(app).patch(`/api/projects/${p.id}`).set(auth(admin.token)).send({ name: 'Yeni ad' });
    expect(res.status).toBe(200);
    const after = await request(app).get(`/api/projects/${p.id}`).set(auth(admin.token));
    expect(after.body.data.name).toBe('Yeni ad');
  });

  test('güncellemede bitiş < başlangıç → 400', async () => {
    const p = await createProject();
    const res = await request(app).patch(`/api/projects/${p.id}`).set(auth(admin.token)).send({ end_date: '2026-10-01' });
    expect(res.status).toBe(400);
  });

  // #96 Karar 8: proje düzenleme yalnızca Yönetici'de (API sözleşmesi + FR-04 geçerli; SRS tablosu v1.1'de düzeltilecek)
  test('Ekip Üyesi üyesi olduğu projeyi de güncelleyemez → 403 ve proje değişmez (#96 Karar 8)', async () => {
    const before = await request(app).get('/api/projects/1').set(auth(admin.token));
    const res = await request(app).patch('/api/projects/1').set(auth(member.token)).send({ name: 'Üye değiştirdi' });
    expect(res.status).toBe(403);
    const after = await request(app).get('/api/projects/1').set(auth(admin.token));
    expect(after.body.data.name).toBe(before.body.data.name);
  });

  test('TS-ROL-02: Ekip Üyesi proje silemez → 403 ve proje silinmez', async () => {
    const res = await request(app).delete('/api/projects/1').set(auth(member.token));
    expect(res.status).toBe(403);
    const still = await request(app).get('/api/projects/1').set(auth(admin.token));
    expect(still.status).toBe(200);
  });

  test('TS-PRJ-04: Yönetici siler → 204; görevleriyle birlikte listeden kalkar', async () => {
    const p = await createProject();
    await pool.query("INSERT INTO tasks (project_id, title) VALUES ($1, 'silinecek görev')", [p.id]);
    const res = await request(app).delete(`/api/projects/${p.id}`).set(auth(admin.token));
    expect(res.status).toBe(204);
    expectDenied(await request(app).get(`/api/projects/${p.id}`).set(auth(admin.token)), [404]);
    const { rowCount } = await pool.query('SELECT 1 FROM tasks WHERE project_id = $1', [p.id]);
    expect(rowCount).toBe(0);
  });
});

describe('Proje üyeliği (FR-05)', () => {
  test('TS-PRJ-03: Yönetici üye ekler → 201; üye projeyi görür', async () => {
    const p = await createProject();
    const add = await request(app).post(`/api/projects/${p.id}/members`).set(auth(admin.token)).send({ userId: outsider.user.id });
    expect(add.status).toBe(201);
    const seen = await request(app).get(`/api/projects/${p.id}`).set(auth(outsider.token));
    expect(seen.status).toBe(200);
  });

  test('aynı kullanıcı ikinci kez eklenemez → 409', async () => {
    const p = await createProject();
    const body = { userId: member.user.id };
    await request(app).post(`/api/projects/${p.id}/members`).set(auth(admin.token)).send(body).expect(201);
    const res = await request(app).post(`/api/projects/${p.id}/members`).set(auth(admin.token)).send(body);
    expect(res.status).toBe(409);
  });

  test('olmayan kullanıcı eklenemez → 400 veya 404', async () => {
    const p = await createProject();
    const res = await request(app).post(`/api/projects/${p.id}/members`).set(auth(admin.token)).send({ userId: 999999 });
    expectDenied(res, [400, 404]);
  });

  test('Ekip Üyesi üye ekleyemez → 403', async () => {
    const res = await request(app).post('/api/projects/1/members').set(auth(member.token)).send({ userId: outsider.user.id });
    expect(res.status).toBe(403);
  });

  test('TS-PRJ-03: Yönetici üyeyi çıkarır → 204; çıkarılan üye projeyi göremez', async () => {
    const p = await createProject();
    await request(app).post(`/api/projects/${p.id}/members`).set(auth(admin.token)).send({ userId: outsider.user.id }).expect(201);
    const del = await request(app).delete(`/api/projects/${p.id}/members/${outsider.user.id}`).set(auth(admin.token));
    expect(del.status).toBe(204);
    expectDenied(await request(app).get(`/api/projects/${p.id}`).set(auth(outsider.token)));
  });
});

// Kullanıcı ekleme, rol atama ve kullanıcı listesinin Yönetici'ye kısıtlanması (#104):
// tests/api/users.admin.api.test.js (#109, Mustafa) kapsıyor; burada tekrarlanmadı.

describe('Bilinen açık hatalar', () => {
  // #110: Ekip Üyesi GET /api/users/:id ile diğer kullanıcıların e-postasını görebiliyor. Düzeltilince gerçek teste çevrilecek.
  test.todo('Ekip Üyesi başka bir kullanıcının detayını göremez → 403/404 (#110)');
});
