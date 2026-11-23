'use strict';
/**
 * Kart #60 — Dosya yükleme/indirme güvenlik testleri (Sprint 5)
 *
 * #58'deki (Mustafa) uç noktalardan ÖNCE, API sözleşmesi v0.5 (server/src/docs/openapi.yaml:
 * /api/projects/{id}/files, /api/files/{id}/download), SRS v1.1 FR-13/FR-14, US-10 ve
 * test senaryolarına (TS-DSY-01…04) göre yazılmıştır. #58 birleşene kadar kırmızıdır.
 *
 * Varsayımlar (sözleşmede açık değil; #58'de farklı çıkarsa test güncellenir):
 *  - Yükleme multipart/form-data, alan adı `file`; başarılı yanıt { data: { id, project_id, name, type, size, uploader_id } }.
 *  - Yanıtlar sunucudaki depolama yolunu (storage_path) içermez.
 *  - İndirme `Content-Disposition: attachment` ile döner (tarayıcıda çalıştırılmaz).
 *  - Proje görünürlüğü #44'teki kuralla aynı: üye olmayan 403 (veya 404) alır, veri sızmaz.
 */
const request = require('supertest');
const { createApp } = require('../../src/app');
const { pool } = require('../../src/db/pool');

const app = createApp();
const PASS = 'Password123!';
const MB = 1024 * 1024;
const uniq = (p) => `${p}.${Date.now()}.${Math.random().toString(36).slice(2, 6)}@sektech.com`;
const auth = (token) => ({ Authorization: `Bearer ${token}` });

// Gerçek bayt imzalı küçük dosyalar
const PDF = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n');
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(64)]);
const EXE = Buffer.concat([Buffer.from('MZ'), Buffer.alloc(256)]); // Windows çalıştırılabilir imzası
const HTML = Buffer.from('<html><script>alert(1)</script></html>');

async function login(email, password = PASS) {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return { token: res.body.data.token, user: res.body.data.user };
}

// Uç noktanın kendisi yokken dönen 404'ü kabul etmez (aksi halde #58 yokken testler yanlışlıkla geçer)
function expectDenied(res, allowed = [403, 404]) {
  expect(allowed).toContain(res.status);
  expect(res.body.error.message).not.toMatch(/^Uç nokta bulunamadı/);
  expect(res.body).not.toHaveProperty('data');
}
function expectRejected(res, allowed = [400]) {
  expect(allowed).toContain(res.status);
  expect(res.body).not.toHaveProperty('data');
}

let admin;
let member; // Utku — test projesinin üyesi
let member2; // Mert — aynı projede ikinci üye
let outsider; // kayıt olmuş, projede üye değil
let projectId;

const upload = (who, buffer, filename, contentType) =>
  request(app).post(`/api/projects/${projectId}/files`).set(auth(who.token)).attach('file', buffer, { filename, contentType });
const rowsNamed = async (name) =>
  (await pool.query('SELECT id, name, storage_path FROM files WHERE project_id = $1 AND name = $2', [projectId, name])).rows;
const fileCount = async () => Number((await pool.query('SELECT count(*) FROM files WHERE project_id = $1', [projectId])).rows[0].count);

beforeAll(async () => {
  admin = await login('hakan@sektech.com');
  member = await login('utku@sektech.com');
  member2 = await login('mert@sektech.com');
  const email = uniq('dosya-disarida');
  await request(app).post('/api/auth/register').send({ name: 'Dosya Dışı', email, password: 'Gizli123!' }).expect(201);
  outsider = await login(email, 'Gizli123!');

  const p = await request(app).post('/api/projects').set(auth(admin.token)).send({ name: `Dosya testi ${Date.now()}` }).expect(201);
  projectId = p.body.data.id;
  await request(app).post(`/api/projects/${projectId}/members`).set(auth(admin.token)).send({ userId: member.user.id }).expect(201);
  await request(app).post(`/api/projects/${projectId}/members`).set(auth(admin.token)).send({ userId: member2.user.id }).expect(201);
});
afterAll(() => pool.end());

describe('Kimlik doğrulama zorunlu', () => {
  test.each([
    ['get', '/api/projects/1/files'],
    ['post', '/api/projects/1/files'],
    ['get', '/api/files/1/download'],
  ])('%s %s token olmadan → 401', async (method, url) => {
    const res = await request(app)[method](url);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});

describe('Yükleme ve indirme (FR-13, TS-DSY-01)', () => {
  let file = {};

  test('üye PDF yükler → 201; meta veri döner, depolama yolu sızmaz', async () => {
    const res = await upload(member, PDF, 'rapor.pdf', 'application/pdf');
    expect(res.status).toBe(201);
    file = res.body.data;
    expect(file).toMatchObject({ project_id: projectId, name: 'rapor.pdf', size: PDF.length, uploader_id: member.user.id });
    expect(file.id).toEqual(expect.any(Number));
    expect(JSON.stringify(res.body)).not.toMatch(/storage_path/);
  });

  test('FR-13.4: dosya orijinal adıyla değil üretilmiş anahtarla saklanır', async () => {
    const [row] = await rowsNamed('rapor.pdf');
    expect(row).toBeDefined();
    expect(row.storage_path).not.toContain('rapor');
    expect(row.storage_path).toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  });

  test('başka bir üye aynı dosyayı indirir: içerik birebir, ek olarak sunulur', async () => {
    expect(file.id).toBeDefined();
    const res = await request(app)
      .get(`/api/files/${file.id}/download`)
      .set(auth(member2.token))
      .buffer(true)
      .parse((r, cb) => {
        const chunks = [];
        r.on('data', (c) => chunks.push(c));
        r.on('end', () => cb(null, Buffer.concat(chunks)));
      });
    expect(res.status).toBe(200);
    expect(Buffer.compare(res.body, PDF)).toBe(0);
    expect(res.headers['content-disposition']).toMatch(/^attachment/);
  });

  test('üye proje dosyalarını listeler; liste depolama yolunu içermez', async () => {
    const res = await request(app).get(`/api/projects/${projectId}/files`).set(auth(member.token));
    expect(res.status).toBe(200);
    expect(res.body.data.map((f) => f.id)).toContain(file.id);
    expect(JSON.stringify(res.body)).not.toMatch(/storage_path/);
  });

  test('izinli diğer tür (PNG) kabul edilir → 201', async () => {
    const res = await upload(member, PNG, 'ekran.png', 'image/png');
    expect(res.status).toBe(201);
  });
});

describe('Tür denetimi (FR-13.2/13.3, TS-DSY-02)', () => {
  test.each([
    ['TS-DSY-02: .exe', EXE, 'kurulum.exe', 'application/octet-stream'],
    ['izin listesinde olmayan .html', HTML, 'sayfa.html', 'text/html'],
    ['çift uzantı: rapor.pdf.exe', EXE, 'rapor.pdf.exe', 'application/pdf'],
    ['bayt imzası uyuşmuyor: .pdf adlı çalıştırılabilir', EXE, 'masum.pdf', 'application/pdf'],
    ['bayt imzası uyuşmuyor: .png adlı HTML', HTML, 'resim.png', 'image/png'],
  ])('%s → 400, kayıt oluşmaz', async (_ad, buffer, filename, contentType) => {
    const before = await fileCount();
    expectRejected(await upload(member, buffer, filename, contentType));
    expect(await fileCount()).toBe(before);
  });

  test('dosya alanı olmadan istek → 400', async () => {
    const res = await request(app).post(`/api/projects/${projectId}/files`).set(auth(member.token)).field('not', 'dosya yok');
    expectRejected(res);
  });

  test('dosya adındaki yol parçaları saklama yoluna ve ada taşınmaz', async () => {
    const res = await upload(member, PDF, '../../etc/gizli.pdf', 'application/pdf');
    if (res.status === 201) {
      expect(res.body.data.name).not.toMatch(/[\\/]|\.\./);
      const { rows } = await pool.query('SELECT storage_path FROM files WHERE id = $1', [res.body.data.id]);
      expect(rows[0].storage_path).not.toMatch(/\.\.|gizli/);
    } else {
      expectRejected(res);
    }
  });
});

describe('Boyut sınırı (FR-13.1, TS-DSY-03)', () => {
  test('10 MB üstü dosya → 413 (veya 400), kayıt oluşmaz', async () => {
    const big = Buffer.concat([PDF, Buffer.alloc(10 * MB + 1 - PDF.length)]);
    const before = await fileCount();
    expectRejected(await upload(member, big, 'buyuk.pdf', 'application/pdf'), [413, 400]);
    expect(await fileCount()).toBe(before);
  });

  test('sınırın altındaki büyük dosya (2,5 MB PDF, UAT-03) kabul edilir → 201', async () => {
    const mid = Buffer.concat([PDF, Buffer.alloc(Math.floor(2.5 * MB) - PDF.length)]);
    const res = await upload(member, mid, 'orta.pdf', 'application/pdf');
    expect(res.status).toBe(201);
    expect(res.body.data.size).toBe(mid.length);
  });
});

describe('Yetkisiz erişim (FR-14, TS-DSY-04)', () => {
  let file = {};
  beforeAll(async () => {
    const res = await upload(member, PDF, 'gizli-plan.pdf', 'application/pdf');
    file = res.body.data || {};
  });

  test('üye olmayan indiremez → 403/404, içerik dönmez', async () => {
    expect(file.id).toBeDefined();
    const res = await request(app).get(`/api/files/${file.id}/download`).set(auth(outsider.token));
    expectDenied(res);
    expect(res.text).not.toContain('%PDF');
  });

  test('üye olmayan dosya listesini göremez → 403/404', async () => {
    expectDenied(await request(app).get(`/api/projects/${projectId}/files`).set(auth(outsider.token)));
  });

  test('üye olmayan yükleyemez → 403/404, kayıt oluşmaz', async () => {
    const before = await fileCount();
    expectDenied(await upload(outsider, PDF, 'sizma.pdf', 'application/pdf'));
    expect(await fileCount()).toBe(before);
  });

  test('projeden çıkarılan üye artık indiremez', async () => {
    expect(file.id).toBeDefined();
    await request(app).delete(`/api/projects/${projectId}/members/${member2.user.id}`).set(auth(admin.token)).expect(204);
    expectDenied(await request(app).get(`/api/files/${file.id}/download`).set(auth(member2.token)));
  });

  test('olmayan dosya → 404', async () => {
    const res = await request(app).get('/api/files/999999/download').set(auth(member.token));
    expectDenied(res, [404]);
  });

  test.todo('Göreve dosya bağlama (Karar 11): sözleşmede alan tanımlanınca — başka projenin görevine bağlanamaz');
  test.todo('Dosya silme: sözleşmede uç nokta yok; eklenirse yalnız yükleyen ve Yönetici silebilir');
});
