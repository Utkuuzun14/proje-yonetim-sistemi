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

// API üzerinden oturum aç (test verisini arayüzden bağımsız hazırlamak için)
async function apiLogin(request, email, password = SEED.password) {
  const res = await request.post('/api/auth/login', { data: { email, password } });
  expect(res.ok()).toBeTruthy();
  const { token, user } = (await res.json()).data;
  return { user, headers: { Authorization: `Bearer ${token}` } };
}

// Görevi API ile oluşturur; testin sonunda deleteTask ile silinmeli
async function createTask(request, auth, projectId, data) {
  const res = await request.post(`/api/projects/${projectId}/tasks`, { headers: auth.headers, data });
  expect(res.status()).toBe(201);
  return (await res.json()).data;
}

const deleteTask = (request, auth, id) => request.delete(`/api/tasks/${id}`, { headers: auth.headers });

const suffix = () => `${Date.now() % 1000000}`;

module.exports = { SEED, uniqueEmail, login, logout, apiLogin, createTask, deleteTask, suffix };
