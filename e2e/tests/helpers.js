// Ortak E2E yardımcıları. Seed kullanıcıları: database/seed.sql (parola Password123!)
const { expect } = require('@playwright/test');

const SEED = {
  admin: { email: 'hakan@sektech.com', name: 'Hakan Koço', role: 'Yönetici' },
  member: { email: 'utku@sektech.com', name: 'Utku Uzun', role: 'Ekip Üyesi' },
  password: 'Password123!',
};

const uniqueEmail = (prefix) => `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2, 6)}@sektech.com`;

async function login(page, email, password = SEED.password) {
  await page.goto('/giris');
  await page.getByLabel('E-posta adresi').fill(email);
  await page.getByLabel('Parola').fill(password);
  await page.locator('button[type=submit]').click();
  await expect(page).toHaveURL(/\/uygulama\/projeler/);
}

async function logout(page) {
  await page.getByRole('button', { name: 'Çıkış yap' }).click();
  await expect(page).toHaveURL(/\/giris/);
}

module.exports = { SEED, uniqueEmail, login, logout };
