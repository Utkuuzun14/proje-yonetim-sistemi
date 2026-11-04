'use strict';
/**
 * Kart #53 — Görev ve yorum API kabul testleri (Sprint 4)
 *
 * #51'deki (Mustafa) uç noktalardan ÖNCE, API sözleşmesi v0.5 (server/src/docs/openapi.yaml:
 * /api/projects/{id}/tasks, /api/tasks/{id}, /api/tasks/{id}/comments), SRS v1.1 FR-06/07/08/15 ve
 * test senaryolarına (TS-GRV, TS-YRM) göre yazılmıştır. #51 birleşene kadar kırmızıdır.
 *
 * Varsayımlar (sözleşmede açık değilse docs/backend/api-sozlesmesi.md §1):
 *  - Başarılı yanıtlar { data: ... }; POST yeni kaydı döner.
 *  - Görev alanları VT ile aynı adlarda: id, project_id, title, description, status, priority,
 *    assignee_id, start_date, end_date ('YYYY-AA-GG'), type ('Task' | 'Bug' | 'Feature', varsayılan 'Task').
 *  - Proje görünürlüğü #44'teki kuralla aynı: üye olmayan 404 (veya 403) alır, veri sızmaz.
 * Kapsam kararları: Hakan, #47 Karar 9–13 (1 Kasım 2026).
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

// Uç noktanın kendisi yokken dönen 404'ü kabul etmez (aksi halde #51 yokken testler yanlışlıkla geçer)
function expectDenied(res, allowed = [403, 404]) {
  expect(allowed).toContain(res.status);
  expect(res.body.error.message).not.toMatch(/^Uç nokta bulunamadı/);
  expect(res.body).not.toHaveProperty('data');
}
function expectValidation(res, field) {
  expect(res.status).toBe(400);
  expect(res.body.error.code).toBe('VALIDATION_ERROR');
  if (field) expect(res.body.error.details.map((d) => d.field)).toContain(field);
}

let admin;
let member; // Utku — test projesinin üyesi (Ekip Üyesi)
let member2; // Mert — aynı projede ikinci Ekip Üyesi
let outsider; // kayıt olmuş, projede üye değil
let projectId;

beforeAll(async () => {
  admin = await login('hakan@sektech.com');
  member = await login('utku@sektech.com');
  member2 = await login('mert@sektech.com');
  const email = uniq('gorev-disarida');
  await request(app).post('/api/auth/register').send({ name: 'Görev Dışı', email, password: 'Gizli123!' }).expect(201);
  outsider = await login(email, 'Gizli123!');

  const p = await request(app)
    .post('/api/projects')
    .set(auth(admin.token))
    .send({ name: `Görev testi ${Date.now()}`, start_date: '2026-11-01', end_date: '2026-12-31' })
    .expect(201);
  projectId = p.body.data.id;
  await request(app).post(`/api/projects/${projectId}/members`).set(auth(admin.token)).send({ userId: member.user.id }).expect(201);
  await request(app).post(`/api/projects/${projectId}/members`).set(auth(admin.token)).send({ userId: member2.user.id }).expect(201);
});
afterAll(() => pool.end());

const taskBody = (o = {}) => ({
  title: `Görev ${Math.random().toString(36).slice(2, 7)}`,
  description: 'Kabul testi görevi',
  priority: 'Medium',
  assignee_id: member.user.id,
  start_date: '2026-11-05',
  end_date: '2026-11-10',
  ...o,
});
async function createTask(o) {
  const res = await request(app).post(`/api/projects/${projectId}/tasks`).set(auth(admin.token)).send(taskBody(o));
  expect(res.status).toBe(201);
  return res.body.data;
}
const historyOf = async (taskId) =>
  (await pool.query('SELECT old_status, new_status, changed_by_id FROM task_status_history WHERE task_id = $1 ORDER BY id', [taskId])).rows;

describe('Kimlik doğrulama zorunlu', () => {
  test.each([
    ['get', '/api/projects/1/tasks'],
    ['post', '/api/projects/1/tasks'],
    ['patch', '/api/tasks/1'],
    ['delete', '/api/tasks/1'],
    ['get', '/api/tasks/1/comments'],
    ['post', '/api/tasks/1/comments'],
    ['get', '/api/tasks/1/history'],
  ])('%s %s token olmadan → 401', async (method, url) => {
    const res = await request(app)[method](url).send({});
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});

describe('Görev oluşturma (FR-06)', () => {
  test('TS-GRV-01: Yönetici görev oluşturur ve atar → 201, varsayılan durum To Do', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set(auth(admin.token))
      .send(taskBody({ title: 'Kayıt formu', priority: 'High' }));
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      project_id: projectId,
      title: 'Kayıt formu',
      status: 'To Do',
      priority: 'High',
      assignee_id: member.user.id,
      start_date: '2026-11-05',
      end_date: '2026-11-10',
    });
    expect(res.body.data.id).toEqual(expect.any(Number));
  });

  test('başlık eksik → 400', async () => {
    expectValidation(await request(app).post(`/api/projects/${projectId}/tasks`).set(auth(admin.token)).send(taskBody({ title: '' })), 'title');
  });

  test('başlık 150 karakteri aşarsa → 400; tam 150 kabul (Karar 13, SRS FR-06)', async () => {
    const url = `/api/projects/${projectId}/tasks`;
    expectValidation(await request(app).post(url).set(auth(admin.token)).send(taskBody({ title: 'x'.repeat(151) })), 'title');
    expect((await request(app).post(url).set(auth(admin.token)).send(taskBody({ title: 'x'.repeat(150) }))).status).toBe(201);
  });

  test.each([
    ['status', 'Bitti123'],
    ['priority', 'Süper'],
  ])('TS-GRV-04: geçersiz %s değeri → 400', async (field, value) => {
    expectValidation(await request(app).post(`/api/projects/${projectId}/tasks`).set(auth(admin.token)).send(taskBody({ [field]: value })), field);
  });

  test('bitiş tarihi başlangıçtan önce → 400', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set(auth(admin.token))
      .send(taskBody({ start_date: '2026-11-20', end_date: '2026-11-01' }));
    expectValidation(res, 'end_date');
  });

  test('TS-GRV-02: proje üyesi olmayan kişiye atama → 400', async () => {
    const res = await request(app).post(`/api/projects/${projectId}/tasks`).set(auth(admin.token)).send(taskBody({ assignee_id: outsider.user.id }));
    expectValidation(res, 'assignee_id');
  });

  test('olmayan projeye görev → 404', async () => {
    expectDenied(await request(app).post('/api/projects/999999/tasks').set(auth(admin.token)).send(taskBody()), [404]);
  });

  test('üye olmayan kullanıcı görev oluşturamaz → 403/404', async () => {
    expectDenied(await request(app).post(`/api/projects/${projectId}/tasks`).set(auth(outsider.token)).send(taskBody({ assignee_id: null })));
  });

  test('Ekip Üyesi üyesi olduğu projede görev oluşturur → 201 (Karar 9, SRS FR-03)', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set(auth(member.token))
      .send(taskBody({ assignee_id: member.user.id }));
    expect(res.status).toBe(201);
    expect(res.body.data.project_id).toBe(projectId);
  });

  test('TS-ROL-03: Ekip Üyesi başkasına görev atayamaz → 403 (Karar 10)', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set(auth(member.token))
      .send(taskBody({ assignee_id: member2.user.id }));
    expectDenied(res, [403]);
  });

  test('görev türü: varsayılan Task, Bug/Feature kabul, geçersiz → 400 (Karar 11)', async () => {
    const url = `/api/projects/${projectId}/tasks`;
    const def = await request(app).post(url).set(auth(admin.token)).send(taskBody());
    expect(def.status).toBe(201);
    expect(def.body.data.type).toBe('Task');
    const bug = await request(app).post(url).set(auth(admin.token)).send(taskBody({ type: 'Bug' }));
    expect(bug.status).toBe(201);
    expect(bug.body.data.type).toBe('Bug');
    expectValidation(await request(app).post(url).set(auth(admin.token)).send(taskBody({ type: 'Epic' })), 'type');
  });
});

describe('Görev listeleme ve filtreler', () => {
  let a;
  let b;
  beforeAll(async () => {
    a = await createTask({ title: 'Filtre A', start_date: '2026-11-03', end_date: '2026-11-04' });
    b = await createTask({ title: 'Filtre B', assignee_id: admin.user.id, start_date: '2026-12-10', end_date: '2026-12-12' });
    await request(app).patch(`/api/tasks/${b.id}`).set(auth(admin.token)).send({ status: 'Done' }).expect(200);
  });

  test('proje üyesi projenin görevlerini listeler', async () => {
    const res = await request(app).get(`/api/projects/${projectId}/tasks`).set(auth(member.token));
    expect(res.status).toBe(200);
    expect(res.body.data.map((t) => t.id)).toEqual(expect.arrayContaining([a.id, b.id]));
    res.body.data.forEach((t) => expect(t.project_id).toBe(projectId));
  });

  test('TS-ROL-04: üye olmayan görevleri göremez → 403/404', async () => {
    expectDenied(await request(app).get(`/api/projects/${projectId}/tasks`).set(auth(outsider.token)));
  });

  test('duruma göre filtre: ?status=Done', async () => {
    const res = await request(app).get(`/api/projects/${projectId}/tasks`).query({ status: 'Done' }).set(auth(admin.token));
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    res.body.data.forEach((t) => expect(t.status).toBe('Done'));
    expect(res.body.data.map((t) => t.id)).toContain(b.id);
  });

  test('kişiye göre filtre: ?assigneeId=', async () => {
    const res = await request(app).get(`/api/projects/${projectId}/tasks`).query({ assigneeId: member.user.id }).set(auth(admin.token));
    expect(res.status).toBe(200);
    res.body.data.forEach((t) => expect(t.assignee_id).toBe(member.user.id));
    expect(res.body.data.map((t) => t.id)).toContain(a.id);
    expect(res.body.data.map((t) => t.id)).not.toContain(b.id);
  });

  test('tarih aralığı filtresi: ?from=&to= (takvim/Gantt için)', async () => {
    const res = await request(app).get(`/api/projects/${projectId}/tasks`).query({ from: '2026-11-01', to: '2026-11-30' }).set(auth(admin.token));
    expect(res.status).toBe(200);
    const ids = res.body.data.map((t) => t.id);
    expect(ids).toContain(a.id); // tamamen aralığın içinde
    expect(ids).not.toContain(b.id); // tamamen aralığın dışında
  });

  test('geçersiz filtre değeri → 400', async () => {
    expectValidation(await request(app).get(`/api/projects/${projectId}/tasks`).query({ status: 'Bitti123' }).set(auth(admin.token)));
  });
});

describe('Görev güncelleme ve durum geçmişi (FR-07, FR-08)', () => {
  test('Yönetici başlığı günceller → 200 ve kalıcı', async () => {
    const t = await createTask();
    const res = await request(app).patch(`/api/tasks/${t.id}`).set(auth(admin.token)).send({ title: 'Yeni başlık' });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Yeni başlık');
    const list = await request(app).get(`/api/projects/${projectId}/tasks`).set(auth(admin.token));
    expect(list.body.data.find((x) => x.id === t.id).title).toBe('Yeni başlık');
  });

  test('TS-GRV-03 / TS-GRV-05: proje üyesi durumu değiştirir → geçmişe kim/eski/yeni yazılır', async () => {
    const t = await createTask();
    const r1 = await request(app).patch(`/api/tasks/${t.id}`).set(auth(member.token)).send({ status: 'In Progress' });
    expect(r1.status).toBe(200);
    expect(r1.body.data.status).toBe('In Progress');
    await request(app).patch(`/api/tasks/${t.id}`).set(auth(member.token)).send({ status: 'Done' }).expect(200);

    const history = await historyOf(t.id);
    expect(history.slice(-2)).toEqual([
      { old_status: 'To Do', new_status: 'In Progress', changed_by_id: member.user.id },
      { old_status: 'In Progress', new_status: 'Done', changed_by_id: member.user.id },
    ]);
  });

  test('durum dışı alan değişikliği geçmiş kaydı üretmez', async () => {
    const t = await createTask();
    const before = (await historyOf(t.id)).length;
    await request(app).patch(`/api/tasks/${t.id}`).set(auth(admin.token)).send({ description: 'Sadece açıklama' }).expect(200);
    expect((await historyOf(t.id)).length).toBe(before);
  });

  test('geçersiz durum → 400, görev ve geçmiş değişmez', async () => {
    const t = await createTask();
    const before = await historyOf(t.id);
    expectValidation(await request(app).patch(`/api/tasks/${t.id}`).set(auth(admin.token)).send({ status: 'Bitti123' }), 'status');
    expect(await historyOf(t.id)).toEqual(before);
  });

  test('güncellemede proje dışı kişiye atama → 400', async () => {
    const t = await createTask();
    expectValidation(await request(app).patch(`/api/tasks/${t.id}`).set(auth(admin.token)).send({ assignee_id: outsider.user.id }), 'assignee_id');
  });

  test('üye olmayan görevi güncelleyemez → 403/404, durum değişmez', async () => {
    const t = await createTask();
    expectDenied(await request(app).patch(`/api/tasks/${t.id}`).set(auth(outsider.token)).send({ status: 'Done' }));
    const { rows } = await pool.query('SELECT status FROM tasks WHERE id = $1', [t.id]);
    expect(rows[0].status).toBe('To Do');
  });

  test('olmayan görev → 404', async () => {
    expectDenied(await request(app).patch('/api/tasks/999999').set(auth(admin.token)).send({ title: 'x' }), [404]);
  });

  test.todo('TS-GRV-06: geçmiş yazılamazsa durum değişikliği geri alınır (transaction) — #51/#52 tasarımı netleşince');
  test.todo('Aynı duruma geçiş sahte geçmiş kaydı üretmez (ürün önerisi, #34 H5-02)');
  test.todo('Done olunca kapanış zamanı (FR-07 madde 3 — şemada alan yok, Karar 11 kapsamı dışında)');
});

describe('Ekip Üyesi düzenleme sınırları (Karar 10, TS-ROL-03)', () => {
  test('Ekip Üyesi kendi görevinin başlığını düzenler → 200', async () => {
    const t = await createTask({ assignee_id: member.user.id });
    const res = await request(app).patch(`/api/tasks/${t.id}`).set(auth(member.token)).send({ title: 'Kendi görevim' });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Kendi görevim');
  });

  test('Ekip Üyesi başkasının görevini düzenleyemez → 403, başlık değişmez', async () => {
    const t = await createTask({ assignee_id: member2.user.id });
    expectDenied(await request(app).patch(`/api/tasks/${t.id}`).set(auth(member.token)).send({ title: 'Ele geçirildi' }), [403]);
    const { rows } = await pool.query('SELECT title FROM tasks WHERE id = $1', [t.id]);
    expect(rows[0].title).toBe(t.title);
  });

  test('Ekip Üyesi atamayı değiştiremez (kendi görevinde bile) → 403', async () => {
    const t = await createTask({ assignee_id: member.user.id });
    expectDenied(await request(app).patch(`/api/tasks/${t.id}`).set(auth(member.token)).send({ assignee_id: member2.user.id }), [403]);
  });

  test('durum değiştirmeyi herkes yapabilir: başkasının görevinde de → 200 ve geçmiş yazılır', async () => {
    const t = await createTask({ assignee_id: member2.user.id });
    const res = await request(app).patch(`/api/tasks/${t.id}`).set(auth(member.token)).send({ status: 'In Progress' });
    expect(res.status).toBe(200);
    expect((await historyOf(t.id)).slice(-1)[0]).toEqual({ old_status: 'To Do', new_status: 'In Progress', changed_by_id: member.user.id });
  });

  test('Yönetici her görevi düzenler ve atamayı değiştirir → 200', async () => {
    const t = await createTask({ assignee_id: member.user.id });
    const res = await request(app).patch(`/api/tasks/${t.id}`).set(auth(admin.token)).send({ assignee_id: member2.user.id });
    expect(res.status).toBe(200);
    expect(res.body.data.assignee_id).toBe(member2.user.id);
  });
});

describe('Görev durum geçmişi uç noktası (Karar 12, US-05)', () => {
  test('GET /api/tasks/:id/history → değişiklikler kronolojik, kim/eski/yeni ile', async () => {
    const t = await createTask();
    await request(app).patch(`/api/tasks/${t.id}`).set(auth(member.token)).send({ status: 'In Progress' }).expect(200);
    await request(app).patch(`/api/tasks/${t.id}`).set(auth(admin.token)).send({ status: 'Done' }).expect(200);
    const res = await request(app).get(`/api/tasks/${t.id}/history`).set(auth(member.token));
    expect(res.status).toBe(200);
    expect(res.body.data.slice(-2)).toEqual([
      expect.objectContaining({ old_status: 'To Do', new_status: 'In Progress', changed_by_id: member.user.id }),
      expect.objectContaining({ old_status: 'In Progress', new_status: 'Done', changed_by_id: admin.user.id }),
    ]);
  });

  test('üye olmayan geçmişi göremez → 403/404', async () => {
    const t = await createTask();
    expectDenied(await request(app).get(`/api/tasks/${t.id}/history`).set(auth(outsider.token)));
  });

  test('olmayan görev → 404', async () => {
    expectDenied(await request(app).get('/api/tasks/999999/history').set(auth(admin.token)), [404]);
  });
});

describe('Görev silme', () => {
  test('Ekip Üyesi görev silemez → 403, görev durur', async () => {
    const t = await createTask();
    expectDenied(await request(app).delete(`/api/tasks/${t.id}`).set(auth(member.token)), [403]);
    const { rowCount } = await pool.query('SELECT 1 FROM tasks WHERE id = $1', [t.id]);
    expect(rowCount).toBe(1);
  });

  test('Yönetici siler → 204; yorumları ve geçmişi de gider', async () => {
    const t = await createTask();
    await request(app).patch(`/api/tasks/${t.id}`).set(auth(admin.token)).send({ status: 'In Progress' }).expect(200);
    await request(app).post(`/api/tasks/${t.id}/comments`).set(auth(member.token)).send({ content: 'silinecek' }).expect(201);

    expect((await request(app).delete(`/api/tasks/${t.id}`).set(auth(admin.token))).status).toBe(204);
    expectDenied(await request(app).patch(`/api/tasks/${t.id}`).set(auth(admin.token)).send({ title: 'x' }), [404]);
    for (const table of ['comments', 'task_status_history']) {
      const { rowCount } = await pool.query(`SELECT 1 FROM ${table} WHERE task_id = $1`, [t.id]);
      expect(rowCount).toBe(0);
    }
  });
});

describe('Görev yorumları (FR-15)', () => {
  let task;
  beforeAll(async () => {
    task = await createTask({ title: 'Yorum görevi' });
  });

  test('TS-YRM-01: proje üyesi yorum ekler → 201; yazar sunucuda belirlenir', async () => {
    const res = await request(app)
      .post(`/api/tasks/${task.id}/comments`)
      .set(auth(member.token))
      .send({ content: 'Formun mobil hali hazır.', author_id: admin.user.id }); // istemcinin yazarı yok sayılmalı
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ task_id: task.id, content: 'Formun mobil hali hazır.', author_id: member.user.id });
  });

  test('yorumlar kronolojik listelenir', async () => {
    await request(app).post(`/api/tasks/${task.id}/comments`).set(auth(admin.token)).send({ content: 'birinci' }).expect(201);
    await request(app).post(`/api/tasks/${task.id}/comments`).set(auth(member.token)).send({ content: 'ikinci' }).expect(201);
    const res = await request(app).get(`/api/tasks/${task.id}/comments`).set(auth(member.token));
    expect(res.status).toBe(200);
    const contents = res.body.data.map((c) => c.content);
    expect(contents.indexOf('birinci')).toBeLessThan(contents.indexOf('ikinci'));
  });

  test.each([[''], ['   ']])('TS-YRM-02: boş yorum (%j) → 400', async (content) => {
    expectValidation(await request(app).post(`/api/tasks/${task.id}/comments`).set(auth(member.token)).send({ content }), 'content');
  });

  test('üye olmayan yorum ekleyemez ve okuyamaz → 403/404', async () => {
    expectDenied(await request(app).post(`/api/tasks/${task.id}/comments`).set(auth(outsider.token)).send({ content: 'sızma' }));
    expectDenied(await request(app).get(`/api/tasks/${task.id}/comments`).set(auth(outsider.token)));
  });

  test('olmayan göreve yorum → 404', async () => {
    expectDenied(await request(app).post('/api/tasks/999999/comments').set(auth(member.token)).send({ content: 'x' }), [404]);
  });

  test('script içeren yorum veri olarak saklanır (render güvenliği arayüzde, TS-GRV-09)', async () => {
    const res = await request(app).post(`/api/tasks/${task.id}/comments`).set(auth(member.token)).send({ content: '<script>alert(1)</script>' });
    expect(res.status).toBe(201);
    expect(res.body.data.content).toBe('<script>alert(1)</script>');
  });

  test.todo('TS-YRM-03: Ekip Üyesi başkasının yorumunu silemez → 403 (silme uç noktası sözleşmede yok)');
});
