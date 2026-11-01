// US-01 · TS-AUTH-01/04/05/07/08/09 — kayıt, giriş, oturum ve çıkış (gerçek API + VT)
const { test, expect } = require('@playwright/test');
const { SEED, uniqueEmail, login, logout } = require('./helpers');

test.describe('Kimlik doğrulama', () => {
  test('TS-AUTH-09: zayıf parolayla kayıt engellenir ve kural mesajı görünür', async ({ page }) => {
    await page.goto('/kayit');
    await page.getByLabel('Ad soyad').fill('E2E Zayıf');
    await page.getByLabel('E-posta adresi').fill(uniqueEmail('zayif'));
    await page.getByLabel('Parola').fill('zayifsifre');
    await page.locator('button[type=submit]').click();
    await expect(page).toHaveURL(/\/kayit/);
    await expect(page.getByText(/büyük harf, küçük harf, rakam ve özel karakter/i)).toBeVisible();
  });

  test('TS-AUTH-01/04: geçerli kayıt → çalışma alanı; yenilemede oturum korunur', async ({ page }) => {
    await page.goto('/kayit');
    await page.getByLabel('Ad soyad').fill('E2E Yeni Üye');
    await page.getByLabel('E-posta adresi').fill(uniqueEmail('kayit'));
    await page.getByLabel('Parola').fill('Gizli123!');
    await page.locator('button[type=submit]').click();
    await expect(page).toHaveURL(/\/uygulama\/projeler/);
    await expect(page.locator('aside')).toContainText('E2E Yeni Üye');
    await expect(page.locator('aside')).toContainText('Ekip Üyesi');

    await page.reload();
    await expect(page).toHaveURL(/\/uygulama\/projeler/);
    await expect(page.locator('aside')).toContainText('E2E Yeni Üye');
  });

  test('TS-AUTH-05: yanlış parola → genel hata mesajı, giriş sayfasında kalır', async ({ page }) => {
    await page.goto('/giris');
    await page.getByLabel('E-posta adresi').fill(SEED.admin.email);
    await page.getByLabel('Parola').fill('Yanlis123!');
    await page.locator('button[type=submit]').click();
    await expect(page).toHaveURL(/\/giris/);
    await expect(page.getByRole('alert')).toContainText(/hatalı/i);
  });

  test('TS-AUTH-08: çıkıştan sonra korumalı sayfa açılmaz', async ({ page }) => {
    await login(page, SEED.member.email);
    await logout(page);
    await page.goto('/uygulama/projeler');
    await expect(page).toHaveURL(/\/giris/);
  });

  test('TS-AUTH-07: geçersiz token ile korumalı sayfa → giriş ekranı', async ({ page }) => {
    await login(page, SEED.member.email);
    await page.evaluate(() => {
      for (const k of Object.keys(sessionStorage)) sessionStorage.setItem(k, 'bozuk.token.degeri');
    });
    await page.reload();
    await expect(page).toHaveURL(/\/giris/);
  });
});
