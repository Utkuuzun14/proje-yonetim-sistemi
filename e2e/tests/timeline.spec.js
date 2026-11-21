// US-07 · TS-TKV-01…03, TS-GNT-01 — Takvim ve salt okunur Gantt (#129) gerçek görev API'sine karşı (#67).
// Görevler sabit bir geçmiş/gelecek aya (Mart 2031) konur; seed görevleriyle karışmaz.
const { test, expect } = require('@playwright/test');
const { SEED, login, apiLogin, createTask, deleteTask, suffix } = require('./helpers');

const PROJECT_ID = 1;
const URL = `/uygulama/projeler/${PROJECT_ID}/takvim`;

const day = (page, iso) => page.getByRole('region', { name: 'Aylık takvim' }).getByRole('region', { name: iso, exact: true });

async function openMonth(page, monthLabel, year) {
  await page.goto(URL);
  await expect(page.getByRole('button', { name: 'Takvim' })).toBeVisible();
  await page.getByLabel('Görüntülenen ay').selectOption({ label: monthLabel });
  await page.getByLabel('Görüntülenen yıl').fill(String(year));
}

test.describe('Takvim ve Gantt (Sprint 5)', () => {
  let admin;
  const created = [];

  test.beforeEach(async ({ request }) => {
    admin = await apiLogin(request, SEED.admin.email);
  });

  test.afterEach(async ({ request }) => {
    while (created.length) await deleteTask(request, admin, created.pop().id);
  });

  test('TS-TKV-01/02: aralıklı görev başlangıç–bitiş günlerinde, tek tarihli görev yalnız o günde görünür', async ({ page, request }) => {
    const s = suffix();
    const ranged = await createTask(request, admin, PROJECT_ID, { title: `E2E Aralık ${s}`, start_date: '2031-03-10', end_date: '2031-03-12' });
    const single = await createTask(request, admin, PROJECT_ID, { title: `E2E Tek gün ${s}`, end_date: '2031-03-20' });
    created.push(ranged, single);

    await login(page, SEED.member.email);
    await openMonth(page, 'Mart', 2031);
    await expect(page.getByRole('status').filter({ hasText: 'görev bu ayla kesişiyor' })).toContainText('2 görev');

    for (const d of ['2031-03-10', '2031-03-11', '2031-03-12']) await expect(day(page, d)).toContainText(ranged.title);
    for (const d of ['2031-03-09', '2031-03-13']) await expect(day(page, d)).not.toContainText(ranged.title);
    await expect(day(page, '2031-03-20')).toContainText(single.title);
    await expect(day(page, '2031-03-19')).not.toContainText(single.title);

    // Önceki ay: görev yok
    await page.getByRole('button', { name: 'Önceki ay' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'görev bu ayla kesişiyor' })).toContainText('0 görev');
  });

  test('TS-TKV-03: ay sınırını aşan görev iki ayda da görünür; arama süzgeci çalışır', async ({ page, request }) => {
    const s = suffix();
    const spanning = await createTask(request, admin, PROJECT_ID, { title: `E2E Ay geçişi ${s}`, start_date: '2031-03-30', end_date: '2031-04-02' });
    created.push(spanning);

    await login(page, SEED.member.email);
    await openMonth(page, 'Mart', 2031);
    await expect(day(page, '2031-03-31')).toContainText(spanning.title);
    await page.getByRole('button', { name: 'Sonraki ay' }).click();
    await expect(day(page, '2031-04-02')).toContainText(spanning.title);
    await expect(day(page, '2031-04-03')).not.toContainText(spanning.title);

    await page.getByLabel('Görevlerde ara').fill('eşleşmeyen-metin');
    await expect(page.getByRole('status').filter({ hasText: 'görev bu ayla kesişiyor' })).toContainText('0 görev');
  });

  test('TS-GNT-01: Gantt salt okunur; tarih aralığı ve tek tarih etiketi doğru, tarihsiz görev ayrı listede', async ({ page, request }) => {
    const s = suffix();
    const ranged = await createTask(request, admin, PROJECT_ID, { title: `E2E Gantt ${s}`, start_date: '2031-03-05', end_date: '2031-03-15' });
    const single = await createTask(request, admin, PROJECT_ID, { title: `E2E Gantt tek ${s}`, start_date: '2031-03-25' });
    const undated = await createTask(request, admin, PROJECT_ID, { title: `E2E Tarihsiz ${s}` });
    created.push(ranged, single, undated);

    await login(page, SEED.member.email);
    await openMonth(page, 'Mart', 2031);
    await page.getByRole('button', { name: 'Gantt' }).click();
    const gantt = page.getByRole('region', { name: 'Salt okunur Gantt' });
    await expect(gantt.getByRole('caption')).toContainText('2031-03');

    const rows = gantt.locator('tbody tr');
    await expect(rows.filter({ hasText: ranged.title })).toContainText('2031-03-05 → 2031-03-15');
    await expect(rows.filter({ hasText: single.title })).toContainText('(tek tarih)');
    // Kronolojik sıra
    const titles = await rows.locator('th a').allTextContents();
    expect(titles.indexOf(ranged.title)).toBeLessThan(titles.indexOf(single.title));
    // Salt okunur: Gantt içinde form alanı yok
    await expect(gantt.locator('input, select, textarea')).toHaveCount(0);

    await expect(page.getByRole('heading', { name: 'Tarihleri eksik veya geçersiz görevler' })).toBeVisible();
    await expect(page.locator('main')).toContainText(`${undated.title} · Başlangıç yok → Bitiş yok`);
  });
});
