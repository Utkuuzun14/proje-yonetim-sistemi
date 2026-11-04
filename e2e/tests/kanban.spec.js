// US-06 · TS-KNB-01/02 — ilk Kanban senaryosu (#53). Görev API'si (#51) ve gerçek Kanban ekranı (#50)
// gelene kadar fixme; o PR'lar birleşince test.fixme → test yapılarak etkinleştirilecek.
const { test, expect } = require('@playwright/test');
const { SEED, login } = require('./helpers');

const PROJECT_ID = 1; // Seed: Hakan ve Utku bu projenin üyesi
const BOARD_URL = `/uygulama/projeler/${PROJECT_ID}/gorevler`;

const column = (page, name) => page.getByRole('region', { name, exact: true });
const cardIn = (page, name, title) => column(page, name).getByRole('button', { name: title, exact: true });

async function apiLogin(request, email) {
  const res = await request.post('/api/auth/login', { data: { email, password: SEED.password } });
  expect(res.ok()).toBeTruthy();
  const { token, user } = (await res.json()).data;
  return { user, headers: { Authorization: `Bearer ${token}` } };
}

test.describe('Kanban (Sprint 4)', () => {
  let admin;
  let member;
  let task;

  test.beforeEach(async ({ request }) => {
    admin = await apiLogin(request, SEED.admin.email);
    member = await apiLogin(request, SEED.member.email);
    const res = await request.post(`/api/projects/${PROJECT_ID}/tasks`, {
      headers: admin.headers,
      data: { title: `E2E Kanban ${Date.now() % 100000}`, assignee_id: member.user.id },
    });
    expect(res.status()).toBe(201);
    task = (await res.json()).data;
  });

  test.afterEach(async ({ request }) => {
    await request.delete(`/api/tasks/${task.id}`, { headers: admin.headers });
  });

  test.fixme('TS-KNB-01: kart To Do → In Progress sürüklenir; yenilemede yerinde kalır, geçmiş kaydı oluşur', async ({ page, browser, request, baseURL }) => {
    await login(page, SEED.member.email);
    await page.goto(BOARD_URL);
    await expect(cardIn(page, 'To Do', task.title)).toBeVisible();

    const saved = page.waitForResponse((r) => r.url().endsWith(`/api/tasks/${task.id}`) && r.request().method() === 'PATCH');
    await page.getByTestId(`task-${task.id}`).dragTo(column(page, 'In Progress'));
    expect((await saved).status()).toBe(200);
    await expect(cardIn(page, 'In Progress', task.title)).toBeVisible();

    // Kalıcılık: yenileyince ve ikinci oturumda (Yönetici) aynı sütunda
    await page.reload();
    await expect(cardIn(page, 'In Progress', task.title)).toBeVisible();
    const context = await browser.newContext({ baseURL });
    const adminPage = await context.newPage();
    await login(adminPage, SEED.admin.email);
    await adminPage.goto(BOARD_URL);
    await expect(cardIn(adminPage, 'In Progress', task.title)).toBeVisible();
    await context.close();

    // Erişilebilirlik: klavye alternatifi aynı işi yapar
    await page.getByLabel(`${task.title} durumu`).selectOption('Done');
    await expect(cardIn(page, 'Done', task.title)).toBeVisible();

    // Geçmiş: kim / eski / yeni (Karar 12)
    const history = await request.get(`/api/tasks/${task.id}/history`, { headers: member.headers });
    expect(history.status()).toBe(200);
    expect((await history.json()).data.slice(-2)).toEqual([
      expect.objectContaining({ old_status: 'To Do', new_status: 'In Progress', changed_by_id: member.user.id }),
      expect.objectContaining({ old_status: 'In Progress', new_status: 'Done', changed_by_id: member.user.id }),
    ]);
  });

  test.fixme('TS-KNB-02: sunucu hata dönerse kart eski sütuna geri döner ve hata görünür', async ({ page }) => {
    await login(page, SEED.member.email);
    await page.route(`**/api/tasks/${task.id}`, (route) =>
      route.request().method() === 'PATCH' ? route.fulfill({ status: 500, json: {} }) : route.continue(),
    );
    await page.goto(BOARD_URL);
    await expect(cardIn(page, 'To Do', task.title)).toBeVisible();

    await page.getByTestId(`task-${task.id}`).dragTo(column(page, 'In Progress'));

    await expect(page.locator('main').getByRole('alert')).toBeVisible();
    await expect(cardIn(page, 'To Do', task.title)).toBeEnabled();
    await expect(column(page, 'In Progress').getByTestId(`task-${task.id}`)).toHaveCount(0);
  });
});
