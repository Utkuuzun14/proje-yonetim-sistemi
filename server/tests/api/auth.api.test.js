'use strict';
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { createApp } = require('../../src/app');
const { pool } = require('../../src/db/pool');

const app = createApp();
const uniq = () => `test.${Date.now()}.${Math.random().toString(36).slice(2, 7)}@sektech.com`;

afterAll(() => pool.end());

describe('POST /api/auth/register', () => {
  test('TS-AUTH-01: geçerli bilgilerle kayıt → 201, şifre hash\'li saklanır', async () => {
    const email = uniq();
    const res = await request(app).post('/api/auth/register').send({ name: 'Test Kullanıcı', email, password: 'Gizli123!' });

    expect(res.status).toBe(201);
    expect(res.body.data.user).toMatchObject({ name: 'Test Kullanıcı', email, role: 'Ekip Üyesi' });
    expect(res.body.data.user).not.toHaveProperty('password_hash');
    expect(res.body.data.token).toEqual(expect.any(String));

    const { rows } = await pool.query('SELECT password_hash FROM users WHERE email = $1', [email]);
    expect(rows[0].password_hash).toMatch(/^\$2[aby]\$/);
    expect(rows[0].password_hash).not.toContain('Gizli123!');
  });

  test('TS-AUTH-02: aynı e-posta (büyük/küçük harf farkıyla) ikinci kez → 409', async () => {
    const email = uniq();
    await request(app).post('/api/auth/register').send({ name: 'Bir', email, password: 'Gizli123!' }).expect(201);
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'İki', email: email.toUpperCase(), password: 'Gizli123!' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  test('TS-AUTH-03: geçersiz alanlar → 400 ve alan bazlı hata listesi', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: '', email: 'bozuk', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    const fields = res.body.error.details.map((d) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['name', 'email', 'password']));
  });

  test('bozuk JSON gövdesi → 400 INVALID_JSON', async () => {
    const res = await request(app).post('/api/auth/register').set('Content-Type', 'application/json').send('{"name":');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_JSON');
  });

  test('#103: 1 MB üstü gövde → 413 PAYLOAD_TOO_LARGE', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'hakan@sektech.com', password: 'x'.repeat(1.1 * 1024 * 1024) });
    expect(res.status).toBe(413);
    expect(res.body.error.code).toBe('PAYLOAD_TOO_LARGE');
  });
});

describe('POST /api/auth/login', () => {
  test('TS-AUTH-04: seed kullanıcısı doğru bilgilerle giriş → 200 + token', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'hakan@sektech.com', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body.data.user).toMatchObject({ email: 'hakan@sektech.com', role: 'Yönetici' });
    expect(jwt.decode(res.body.data.token)).toMatchObject({ sub: '1', role: 'Yönetici' });
  });

  test('TS-AUTH-04: kayıt olan kullanıcı giriş yapabilir (e-posta büyük harfle de)', async () => {
    const email = uniq();
    await request(app).post('/api/auth/register').send({ name: 'Yeni', email, password: 'Gizli123!' }).expect(201);
    const res = await request(app).post('/api/auth/login').send({ email: email.toUpperCase(), password: 'Gizli123!' });
    expect(res.status).toBe(200);
  });

  test('TS-AUTH-05: yanlış şifre ve olmayan kullanıcı → 401, aynı mesaj', async () => {
    const wrong = await request(app).post('/api/auth/login').send({ email: 'hakan@sektech.com', password: 'Yanlis123' });
    const none = await request(app).post('/api/auth/login').send({ email: 'yok@sektech.com', password: 'Yanlis123' });

    expect(wrong.status).toBe(401);
    expect(none.status).toBe(401);
    expect(wrong.body.error.message).toBe(none.body.error.message);
  });

  test('eksik alan → 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'hakan@sektech.com' });
    expect(res.status).toBe(400);
  });
});

describe('Korumalı uç noktalar', () => {
  async function tokenFor(email = 'utku@sektech.com') {
    const res = await request(app).post('/api/auth/login').send({ email, password: 'Password123!' });
    return res.body.data.token;
  }

  test('GET /api/auth/me: geçerli token → oturumdaki kullanıcı', async () => {
    const token = await tokenFor();
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ email: 'utku@sektech.com', role: 'Ekip Üyesi' });
    expect(res.body.data).not.toHaveProperty('password_hash');
  });

  test('TS-AUTH-06: token olmadan → 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  test.each([
    ['bozuk token', 'Bearer abc.def.ghi'],
    ['yanlış anahtarla imzalı', `Bearer ${jwt.sign({ sub: '1', role: 'Yönetici' }, 'baska-anahtar')}`],
    ['süresi dolmuş', `Bearer ${jwt.sign({ sub: '1', role: 'Yönetici', exp: Math.floor(Date.now() / 1000) - 60 }, 'test-jwt-secret')}`],
    ['Bearer öneki yok', 'sadece-token'],
  ])('TS-AUTH-07: %s → 401', async (_label, header) => {
    const res = await request(app).get('/api/auth/me').set('Authorization', header);
    expect(res.status).toBe(401);
  });

  test('GET /api/users: listede şifre özeti yok', async () => {
    const token = await tokenFor();
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(7);
    res.body.data.forEach((u) => expect(u).not.toHaveProperty('password_hash'));
  });

  test('GET /api/users/:id: olmayan → 404, geçersiz id → 400', async () => {
    const token = await tokenFor();
    const auth = { Authorization: `Bearer ${token}` };
    expect((await request(app).get('/api/users/99999').set(auth)).status).toBe(404);
    expect((await request(app).get('/api/users/abc').set(auth)).status).toBe(400);
  });

  test('#102: GET /api/users/:id integer sınırı üstünde → 400 (500 değil)', async () => {
    const token = await tokenFor();
    const auth = { Authorization: `Bearer ${token}` };
    expect((await request(app).get('/api/users/99999999999').set(auth)).status).toBe(400);
    expect((await request(app).get('/api/users/2147483648').set(auth)).status).toBe(400);
    expect((await request(app).get('/api/users/2147483647').set(auth)).status).toBe(404);
  });
});

describe('Genel', () => {
  test('GET /api/health → VT ayakta', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ status: 'ok', database: 'up' });
  });

  test('olmayan uç nokta → 404 standart hata formatı', async () => {
    const res = await request(app).get('/api/olmayan');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { code: 'NOT_FOUND', message: expect.any(String) } });
  });

  test('Swagger dokümanı yayında', async () => {
    const json = await request(app).get('/api/openapi.json');
    expect(json.status).toBe(200);
    expect(json.body.openapi).toMatch(/^3\./);
    expect(json.body.paths).toHaveProperty('/api/auth/login');
    const ui = await request(app).get('/api/docs/');
    expect(ui.status).toBe(200);
    expect(ui.text).toContain('swagger');
  });
});
