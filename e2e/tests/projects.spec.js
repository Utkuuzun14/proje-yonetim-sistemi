// US-02/US-03 · TS-ROL-01/02/05 · TS-PRJ-01/02 — rol bazlı proje akışı (Sprint 3 hedefi)
const { test, expect } = require('@playwright/test');
const { SEED, login, logout } = require('./helpers');

test.describe('Projeler ve roller', () => {
  test('TS-PRJ-01/02: Yönetici proje oluşturur; bitiş < başlangıç reddedilir', async ({ page }) => {
    const name = `E2E Proje ${Date.now() % 100000}`;
    await login(page, SEED.admin.email);
    await expect(page.locator('aside')).toContainText(SEED.admin.role);

    await page.getByRole('button', { name: 'Yeni proje' }).click();
    await page.getByLabel('Proje adı').fill(name);
    await page.getByLabel('Başlangıç tarihi').fill('2026-11-10');
    await page.getByLabel('Bitiş tarihi').fill('2026-11-01');
    await page.getByRole('button', { name: 'Projeyi kaydet' }).click();
    await expect(page.locator('.alert').first()).toContainText(/bitiş/i);

    await page.getByLabel('Bitiş tarihi').fill('2026-11-30');
    await page.getByRole('button', { name: 'Projeyi kaydet' }).click();
    await expect(page.getByRole('link', { name })).toBeVisible();

    // Kalıcılık: yenileyince hâlâ listede
    await page.reload();
    await expect(page.getByRole('link', { name })).toBeVisible();
  });

  test('TS-ROL-05: Ekip Üyesi "Yeni proje" düğmesini görmez, üyesi olduğu projeyi açar', async ({ page }) => {
    await login(page, SEED.member.email);
    await expect(page.locator('aside')).toContainText(SEED.member.role);
    await expect(page.getByRole('button', { name: 'Yeni proje' })).toHaveCount(0);

    const project = page.getByRole('link', { name: 'SEK TECH Proje Yönetim Platformu' });
    await expect(project).toBeVisible();
    await project.click();
    await expect(page).toHaveURL(/\/uygulama\/projeler\/\d+/);
    await expect(page.locator('main')).toContainText('SEK TECH Proje Yönetim Platformu');
  });

  test('TS-ROL-04: Ekip Üyesi üyesi olmadığı projeyi listede görmez ve adresle açamaz', async ({ page }) => {
    // Seed: proje 2 ("Mobil Saha Yönetimi") yalnızca Abdulkahhar ve Ümit'e açık (#107)
    await login(page, SEED.member.email);
    // Liste yüklenmeden "görünmüyor" denetimi anlamsız: önce üyesi olduğu proje gelmeli
    await expect(page.getByRole('link', { name: 'SEK TECH Proje Yönetim Platformu' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Mobil Saha Yönetimi' })).toHaveCount(0);

    const response = page.waitForResponse(
      (r) => r.url().endsWith('/api/projects/2') && r.request().method() === 'GET',
    );
    await page.goto('/uygulama/projeler/2');
    expect((await response).status()).toBe(404);
    await expect(page.locator('main').getByRole('alert')).toContainText('erişim iznin yok');
    await expect(page.locator('main')).not.toContainText('Mobil saha ekipleri');
  });

  test('Rol geçişi: Yönetici çıkış yapıp Ekip Üyesi girince yönetim düğmesi kaybolur', async ({ page }) => {
    await login(page, SEED.admin.email);
    await expect(page.getByRole('button', { name: 'Yeni proje' })).toBeVisible();
    await logout(page);
    await login(page, SEED.member.email);
    await expect(page.getByRole('button', { name: 'Yeni proje' })).toHaveCount(0);
  });
});
