'use strict';
/**
 * #58 — files.api.test.js'in (#60) kapsamadığı davranışlar: göreve dosya bağlama (Karar 11),
 * Türkçe dosya adı, MIME türünün istemciden değil içerikten belirlenmesi, Yönetici erişimi.
 */
const request = require('supertest');
const { createApp } = require('../../src/app');
const { pool } = require('../../src/db/pool');

const app = createApp();
const auth = (token) => ({ Authorization: `Bearer ${token}` });
const PDF = Buffer.from('%PDF-1.4\n%%EOF\n');

async function login(email) {
  const res = await request(app).post('/api/auth/login').send({ email, password: 'Password123!' });
  return { token: res.body.data.token, user: res.body.data.user };
}

let admin;
let member;
let projectId;
let otherProjectId;
let taskId;
let otherTaskId;

const upload = (who, { name = 'rapor.pdf', buffer = PDF, contentType = 'application/pdf', fields = {} } = {}) => {
  const req = request(app).post(`/api/projects/${projectId}/files`).set(auth(who.token));
  Object.entries(fields).forEach(([k, v]) => req.field(k, String(v)));
  return req.attach('file', buffer, { filename: name, contentType });
};

beforeAll(async () => {
  admin = await login('hakan@sektech.com');
  member = await login('utku@sektech.com');
  const mk = async (name) => (await request(app).post('/api/projects').set(auth(admin.token)).send({ name }).expect(201)).body.data.id;
  projectId = await mk(`Dosya-görev ${Date.now()}`);
  otherProjectId = await mk(`Başka proje ${Date.now()}`);
  await request(app).post(`/api/projects/${projectId}/members`).set(auth(admin.token)).send({ userId: member.user.id }).expect(201);
  const task = (pid) => request(app).post(`/api/projects/${pid}/tasks`).set(auth(admin.token)).send({ title: 'Ekli görev' }).expect(201);
  taskId = (await task(projectId)).body.data.id;
  otherTaskId = (await task(otherProjectId)).body.data.id;
});
afterAll(() => pool.end());

describe('Göreve dosya bağlama (Karar 11)', () => {
  test('task_id ile yüklenen dosya göreve bağlanır ve ?taskId= ile listelenir', async () => {
    const res = await upload(member, { fields: { task_id: taskId } });
    expect(res.status).toBe(201);
    expect(res.body.data.task_id).toBe(taskId);
    await upload(member, { name: 'baglantisiz.pdf' }).expect(201);

    const list = await request(app).get(`/api/projects/${projectId}/files`).query({ taskId }).set(auth(member.token));
    expect(list.status).toBe(200);
    expect(list.body.data.length).toBeGreaterThan(0);
    list.body.data.forEach((f) => expect(f.task_id).toBe(taskId));
  });

  test('başka projenin görevine bağlanamaz → 400, kayıt oluşmaz', async () => {
    const res = await upload(member, { name: 'yanlis-gorev.pdf', fields: { task_id: otherTaskId } });
    expect(res.status).toBe(400);
    expect(res.body.error.details[0].field).toBe('task_id');
    const { rowCount } = await pool.query('SELECT 1 FROM files WHERE name = $1', ['yanlis-gorev.pdf']);
    expect(rowCount).toBe(0);
  });

  test('geçersiz task_id ve taskId → 400', async () => {
    expect((await upload(member, { fields: { task_id: 'abc' } })).status).toBe(400);
    const res = await request(app).get(`/api/projects/${projectId}/files`).query({ taskId: 'abc' }).set(auth(member.token));
    expect(res.status).toBe(400);
  });

  test('görev silinince dosya projede kalır, bağlantısı kalkar', async () => {
    const t = (await request(app).post(`/api/projects/${projectId}/tasks`).set(auth(admin.token)).send({ title: 'Silinecek' })).body.data;
    const f = (await upload(member, { name: 'kalici.pdf', fields: { task_id: t.id } }).expect(201)).body.data;
    await request(app).delete(`/api/tasks/${t.id}`).set(auth(admin.token)).expect(204);
    const list = await request(app).get(`/api/projects/${projectId}/files`).set(auth(member.token));
    expect(list.body.data.find((x) => x.id === f.id)).toMatchObject({ task_id: null });
  });
});

describe('Ad, tür ve erişim', () => {
  test('Türkçe dosya adı bozulmadan saklanır ve indirmede UTF-8 olarak döner', async () => {
    const name = 'Gereksinim Şartnamesi — Öğrenci.pdf';
    const res = await upload(member, { name });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe(name);
    const dl = await request(app).get(`/api/files/${res.body.data.id}/download`).set(auth(member.token));
    expect(dl.headers['content-disposition']).toContain(`filename*=UTF-8''${encodeURIComponent(name).replace(/'/g, '%27')}`);
  });

  test('MIME türü istemcinin beyanından değil içerikten belirlenir', async () => {
    const res = await upload(member, { name: 'beyan.pdf', contentType: 'text/html' });
    expect(res.status).toBe(201);
    expect(res.body.data.type).toBe('application/pdf');
    const dl = await request(app).get(`/api/files/${res.body.data.id}/download`).set(auth(member.token));
    expect(dl.headers['content-type']).toBe('application/pdf');
    expect(dl.headers['x-content-type-options']).toBe('nosniff');
    expect(dl.headers['cache-control']).toBe('private, no-store');
  });

  test('Yönetici üyesi olmadığı projede de listeler ve indirir', async () => {
    const f = (await upload(member, { name: 'yonetici.pdf' }).expect(201)).body.data;
    await request(app).delete(`/api/projects/${projectId}/members/${admin.user.id}`).set(auth(admin.token)).expect(204);
    expect((await request(app).get(`/api/projects/${projectId}/files`).set(auth(admin.token))).status).toBe(200);
    expect((await request(app).get(`/api/files/${f.id}/download`).set(auth(admin.token))).status).toBe(200);
  });

  test('olmayan projeye yükleme → 404; geçersiz kimlik → 400', async () => {
    const res = await request(app).post('/api/projects/999999/files').set(auth(admin.token)).attach('file', PDF, 'a.pdf');
    expect(res.status).toBe(404);
    expect((await request(app).get('/api/files/abc/download').set(auth(admin.token))).status).toBe(400);
  });

  test('iki dosya birden → 400', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/files`)
      .set(auth(member.token))
      .attach('file', PDF, 'a.pdf')
      .attach('file', PDF, 'b.pdf');
    expect(res.status).toBe(400);
  });
});
