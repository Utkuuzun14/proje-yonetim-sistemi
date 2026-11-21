// US-08 · TS-DSY-01…04 — Dosya ekranı (#129) ve dosya API'si (#58) uçtan uca (#67 regresyon seti).
// Dosya silme uç noktası olmadığı için yüklenen dosyalar VT'de kalır; adlar benzersiz tutulur.
const { test, expect } = require('@playwright/test');
const { SEED, login, apiLogin, createTask, deleteTask, suffix } = require('./helpers');

const PROJECT_ID = 1; // Seed: Hakan ve Utku üye
const FILES_URL = `/uygulama/projeler/${PROJECT_ID}/dosyalar`;
// Geçerli en küçük PDF: sunucu bayt imzasına (%PDF-) bakar
const PDF = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n');

const fileInput = (page) => page.getByLabel('Yüklenecek dosya');
const fileList = (page) => page.locator('.file-list');

async function openFiles(page) {
  await page.goto(FILES_URL);
  await expect(page.getByRole('heading', { name: 'Dosyalar', exact: true })).toBeVisible();
  await expect(page.getByText('Dosyalar yükleniyor…')).toHaveCount(0);
  await expect(fileInput(page)).toBeEnabled();
}

test.describe('Dosyalar (Sprint 5)', () => {
  let admin;
  let task;

  test.beforeEach(async ({ request }) => {
    admin = await apiLogin(request, SEED.admin.email);
    const member = await apiLogin(request, SEED.member.email);
    task = await createTask(request, admin, PROJECT_ID, { title: `E2E Dosya görevi ${suffix()}`, assignee_id: member.user.id });
  });

  test.afterEach(async ({ request }) => {
    await deleteTask(request, admin, task.id);
  });

  test('TS-DSY-01: üye PDF yükler, göreve bağlar, filtreler ve aynı içeriği indirir', async ({ page }) => {
    const name = `e2e-gereksinim-${suffix()}.pdf`;
    await login(page, SEED.member.email);
    await openFiles(page);

    await fileInput(page).setInputFiles({ name, mimeType: 'application/pdf', buffer: PDF });
    await page.getByLabel('Göreve bağla (isteğe bağlı)').selectOption({ label: task.title });
    const uploaded = page.waitForResponse((r) => r.url().endsWith(`/api/projects/${PROJECT_ID}/files`) && r.request().method() === 'POST');
    await page.getByRole('button', { name: 'Dosyayı yükle' }).click();
    expect((await uploaded).status()).toBe(201);
    await expect(page.getByRole('status').filter({ hasText: 'Dosya sunucuya yüklendi.' })).toBeVisible();

    const row = fileList(page).locator('li', { hasText: name });
    await expect(row).toBeVisible();
    await expect(row).toContainText(task.title);

    // Göreve göre filtre: yalnız bu görevin dosyası listelenir
    await page.getByLabel('Dosyaları göreve göre filtrele').selectOption({ label: task.title });
    await expect(fileList(page).locator('li')).toHaveCount(1);
    await expect(row).toBeVisible();

    // İndirme: kimlik doğrulamalı blob, ad ve içerik aynı
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: `${name} indir` }).click();
    const file = await download;
    expect(file.suggestedFilename()).toBe(name);
    const stream = await file.createReadStream();
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    expect(Buffer.concat(chunks).equals(PDF)).toBe(true);
  });

  test('TS-DSY-02: izin verilmeyen uzantı arayüzde, uzantısı PDF ama içeriği PDF olmayan dosya sunucuda reddedilir', async ({ page }) => {
    await login(page, SEED.member.email);
    await openFiles(page);

    // 1) .exe: istemci doğrulaması, istek gitmez
    let posted = false;
    page.on('request', (r) => { if (r.method() === 'POST' && r.url().includes('/files')) posted = true; });
    await fileInput(page).setInputFiles({ name: 'kurulum.exe', mimeType: 'application/octet-stream', buffer: Buffer.from('MZ fake') });
    await page.getByRole('button', { name: 'Dosyayı yükle' }).click();
    await expect(page.locator('main').getByRole('alert')).toContainText('İzin verilen dosya türleri');
    expect(posted).toBe(false);

    // 2) Sahte PDF: uzantı geçer, sunucu bayt imzasından reddeder (400), liste değişmez
    const fake = `sahte-${suffix()}.pdf`;
    await fileInput(page).setInputFiles({ name: fake, mimeType: 'application/pdf', buffer: Buffer.from('<html>pdf değil</html>') });
    const rejected = page.waitForResponse((r) => r.url().endsWith(`/api/projects/${PROJECT_ID}/files`) && r.request().method() === 'POST');
    await page.getByRole('button', { name: 'Dosyayı yükle' }).click();
    expect((await rejected).status()).toBe(400);
    await expect(page.locator('main').getByRole('alert')).toBeVisible();
    await expect(fileList(page).locator('li', { hasText: fake })).toHaveCount(0);
  });

  test('TS-DSY-03: 10 MB üstü dosya arayüzde engellenir', async ({ page }) => {
    await login(page, SEED.member.email);
    await openFiles(page);
    const big = Buffer.concat([PDF, Buffer.alloc(10 * 1024 * 1024)]);
    await fileInput(page).setInputFiles({ name: 'buyuk.pdf', mimeType: 'application/pdf', buffer: big });
    await page.getByRole('button', { name: 'Dosyayı yükle' }).click();
    await expect(page.locator('main').getByRole('alert')).toContainText('en fazla 10 MB');
  });

  test('TS-DSY-04: üye olmayan proje dosyalarını göremez; oturumsuz indirme reddedilir', async ({ page, request }) => {
    // Proje 1'e bir dosya yükle (Yönetici, API)
    const up = await request.post(`/api/projects/${PROJECT_ID}/files`, {
      headers: admin.headers,
      multipart: { file: { name: `gizli-${suffix()}.pdf`, mimeType: 'application/pdf', buffer: PDF } },
    });
    expect(up.status()).toBe(201);
    const saved = (await up.json()).data;

    // Oturumsuz indirme
    expect((await request.get(`/api/files/${saved.id}/download`)).status()).toBe(401);

    // Seed: proje 2'ye Utku üye değil — ekranda liste yerine hata görünür
    await login(page, SEED.member.email);
    const listed = page.waitForResponse((r) => r.url().includes('/api/projects/2/files') && r.request().method() === 'GET');
    await page.goto('/uygulama/projeler/2/dosyalar');
    expect([403, 404]).toContain((await listed).status());
    await expect(page.locator('main').getByRole('alert')).toBeVisible();
    await expect(page.locator('.file-list')).toHaveCount(0);
  });
});
