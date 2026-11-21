'use strict';
/**
 * Kart #44 — Proje API'si: #101'deki RBAC kabul testlerinin dışında kalan sözleşme ayrıntıları
 * (tarih biçimi, ön yüz form gövdesi, kenar durumlar).
 */
const request = require('supertest');
const { createApp } = require('../../src/app');
const { pool } = require('../../src/db/pool');

const app = createApp();
const auth = (token) => ({ Authorization: `Bearer ${token}` });
let admin;
let member;

beforeAll(async () => {
  const login = (email) => request(app).post('/api/auth/login').send({ email, password: 'Password123!' });
  admin = (await login('hakan@sektech.com')).body.data;
  member = (await login('utku@sektech.com')).body.data;
});
afterAll(() => pool.end());

const create = (body) => request(app).post('/api/projects').set(auth(admin.token)).send(body);

describe('Proje API — sözleşme ayrıntıları', () => {
  test('tarihler saat dilimi kayması olmadan YYYY-AA-GG döner', async () => {
    const res = await create({ name: 'Tarih testi', start_date: '2026-11-01', end_date: '2026-11-30' });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ start_date: '2026-11-01', end_date: '2026-11-30' });
  });

  test('ön yüz formu: boş açıklama ve boş tarih null olarak saklanır', async () => {
    const res = await create({ name: '  Boşluklu ad  ', description: '', start_date: '', end_date: '' });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ name: 'Boşluklu ad', description: null, start_date: null, end_date: null });
  });

  test('oluşturan Yönetici projenin üyesi olur; detayda üyeler listelenir', async () => {
    const { body } = await create({ name: 'Üyelik testi' });
    const res = await request(app).get(`/api/projects/${body.data.id}`).set(auth(admin.token));
    expect(res.body.data.members.map((m) => m.id)).toEqual([admin.user.id]);
    expect(res.body.data.members[0]).not.toHaveProperty('password_hash');
  });

  test('geçersiz tarih biçimi → 400', async () => {
    const res = await create({ name: 'x', start_date: '01.11.2026' });
    expect(res.status).toBe(400);
    expect(res.body.error.details[0].field).toBe('start_date');
  });

  test('istemciden gelen owner_id yok sayılır', async () => {
    const res = await create({ name: 'Sahip testi', owner_id: member.user.id });
    expect(res.body.data.owner_id).toBe(admin.user.id);
  });

  test('boş PATCH gövdesi → 400', async () => {
    const res = await request(app).patch('/api/projects/1').set(auth(admin.token)).send({});
    expect(res.status).toBe(400);
  });

  test('olmayan projeyi güncelleme / silme / üye işlemleri → 404', async () => {
    const a = auth(admin.token);
    expect((await request(app).patch('/api/projects/999999').set(a).send({ name: 'x' })).status).toBe(404);
    expect((await request(app).delete('/api/projects/999999').set(a)).status).toBe(404);
    expect((await request(app).post('/api/projects/999999/members').set(a).send({ userId: 1 })).status).toBe(404);
    expect((await request(app).delete('/api/projects/999999/members/1').set(a)).status).toBe(404);
  });

  test('üye olmayan kullanıcıyı çıkarma → 404', async () => {
    const { body } = await create({ name: 'Çıkarma testi' });
    const res = await request(app).delete(`/api/projects/${body.data.id}/members/${member.user.id}`).set(auth(admin.token));
    expect(res.status).toBe(404);
  });

  test('geçersiz kimlikler → 400 (#102 ile aynı kural)', async () => {
    const a = auth(admin.token);
    expect((await request(app).get('/api/projects/abc').set(a)).status).toBe(400);
    expect((await request(app).get('/api/projects/99999999999').set(a)).status).toBe(400);
    expect((await request(app).post('/api/projects/1/members').set(a).send({ userId: 'x' })).status).toBe(400);
  });
});
