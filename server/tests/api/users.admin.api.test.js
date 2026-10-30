'use strict';
/**
 * Kart #44 — Kullanıcı yönetimi ve RBAC (Sprint 3 teslimatı: "Yönetici kullanıcı ekleyip rol atayabiliyor")
 * #104: Ekip Üyesi kullanıcı listesini göremez.
 */
const request = require('supertest');
const { createApp } = require('../../src/app');
const { pool } = require('../../src/db/pool');

const app = createApp();
const PASS = 'Password123!';
const uniq = (p) => `${p}.${Date.now()}.${Math.random().toString(36).slice(2, 6)}@sektech.com`;
const auth = (token) => ({ Authorization: `Bearer ${token}` });

async function login(email, password = PASS) {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return { token: res.body.data.token, user: res.body.data.user };
}

let admin;
let member;

beforeAll(async () => {
  admin = await login('hakan@sektech.com');
  member = await login('utku@sektech.com');
});
afterAll(() => pool.end());

describe('GET /api/users (#104)', () => {
  test('Ekip Üyesi kullanıcı listesini göremez → 403', async () => {
    const res = await request(app).get('/api/users').set(auth(member.token));
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
    expect(res.body).not.toHaveProperty('data');
  });

  test('Yönetici kullanıcı listesini görür → 200', async () => {
    const res = await request(app).get('/api/users').set(auth(admin.token));
    expect(res.status).toBe(200);
    expect(res.body.data.map((u) => u.email)).toContain('utku@sektech.com');
  });
});

describe('POST /api/users — Yönetici kullanıcı ekler', () => {
  const body = (o = {}) => ({ name: 'Yeni Üye', email: uniq('yeni'), password: 'Gizli123!', ...o });

  test('rol verilmezse Ekip Üyesi → 201, şifre özeti dönmez, eklenen giriş yapabilir', async () => {
    const input = body();
    const res = await request(app).post('/api/users').set(auth(admin.token)).send(input);
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ name: 'Yeni Üye', email: input.email, role: 'Ekip Üyesi' });
    expect(res.body.data).not.toHaveProperty('password_hash');
    await request(app).post('/api/auth/login').send({ email: input.email, password: input.password }).expect(200);
  });

  test('rolle birlikte → 201 ve rol atanmış', async () => {
    const res = await request(app).post('/api/users').set(auth(admin.token)).send(body({ role: 'Yönetici' }));
    expect(res.status).toBe(201);
    expect(res.body.data.role).toBe('Yönetici');
  });

  test('kayıtlı e-posta → 409', async () => {
    const res = await request(app).post('/api/users').set(auth(admin.token)).send(body({ email: 'utku@sektech.com' }));
    expect(res.status).toBe(409);
  });

  test('geçersiz rol ve zayıf şifre → 400, alan hataları', async () => {
    const res = await request(app).post('/api/users').set(auth(admin.token)).send(body({ role: 'Süper', password: '123' }));
    expect(res.status).toBe(400);
    expect(res.body.error.details.map((d) => d.field)).toEqual(expect.arrayContaining(['role', 'password']));
  });

  test('Ekip Üyesi kullanıcı ekleyemez → 403', async () => {
    const res = await request(app).post('/api/users').set(auth(member.token)).send(body());
    expect(res.status).toBe(403);
  });

  test('token olmadan → 401', async () => {
    expect((await request(app).post('/api/users').send(body())).status).toBe(401);
  });
});

describe('PATCH /api/users/:id/role — Yönetici rol atar', () => {
  async function newUser() {
    const email = uniq('rol');
    const res = await request(app).post('/api/users').set(auth(admin.token)).send({ name: 'Rol Test', email, password: 'Gizli123!' });
    return { ...(await login(email, 'Gizli123!')), id: res.body.data.id };
  }

  test('Ekip Üyesi → Yönetici: 200 ve yeni yetki eski token ile hemen geçerli', async () => {
    const u = await newUser();
    expect((await request(app).get('/api/users').set(auth(u.token))).status).toBe(403);

    const res = await request(app).patch(`/api/users/${u.id}/role`).set(auth(admin.token)).send({ role: 'Yönetici' });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ id: u.id, role: 'Yönetici' });

    expect((await request(app).get('/api/users').set(auth(u.token))).status).toBe(200);
  });

  test('Ekip Üyesi rol değiştiremez → 403 (FR-03 madde 1)', async () => {
    const res = await request(app).patch(`/api/users/${member.user.id}/role`).set(auth(member.token)).send({ role: 'Yönetici' });
    expect(res.status).toBe(403);
    const me = await request(app).get('/api/auth/me').set(auth(member.token));
    expect(me.body.data.role).toBe('Ekip Üyesi');
  });

  test('Yönetici kendi rolünü değiştiremez → 400', async () => {
    const res = await request(app).patch(`/api/users/${admin.user.id}/role`).set(auth(admin.token)).send({ role: 'Ekip Üyesi' });
    expect(res.status).toBe(400);
  });

  test('olmayan kullanıcı → 404, geçersiz rol → 400', async () => {
    const send = (id, role) => request(app).patch(`/api/users/${id}/role`).set(auth(admin.token)).send({ role });
    expect((await send(999999, 'Yönetici')).status).toBe(404);
    expect((await send(member.user.id, 'Süper')).status).toBe(400);
  });
});
