// US-09 · TS-YRM-01, TS-GRV-09 (R-YRM-03) — görev ayrıntısı, yorum ve XSS koruması (#67).
const { test, expect } = require('@playwright/test');
const { SEED, login, apiLogin, createTask, deleteTask, suffix } = require('./helpers');

const PROJECT_ID = 1;
const BOARD_URL = `/uygulama/projeler/${PROJECT_ID}/gorevler`;
const PAYLOAD = '<img src=x onerror="window.__xss=1"><script>window.__xss=1</script>';

test.describe('Görev ayrıntısı ve yorumlar', () => {
  let admin;
  let task;

  test.beforeEach(async ({ request }) => {
    admin = await apiLogin(request, SEED.admin.email);
    const member = await apiLogin(request, SEED.member.email);
    task = await createTask(request, admin, PROJECT_ID, {
      title: `E2E Yorum ${suffix()}`,
      description: `Açıklama ${PAYLOAD}`,
      assignee_id: member.user.id,
    });
  });

  test.afterEach(async ({ request }) => {
    await deleteTask(request, admin, task.id);
  });

  test('TS-YRM-01: üye yorum yazar; yazar adı sunucudan gelir, yenilemeden sonra da görünür', async ({ page }) => {
    await login(page, SEED.member.email);
    await page.goto(BOARD_URL);
    await page.getByRole('button', { name: task.title, exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Yorumlar' })).toBeVisible();
    await expect(dialog).toContainText('Henüz yorum yok.');

    const text = `İlk inceleme notu ${suffix()}`;
    await dialog.getByLabel('Yorum yaz').fill(text);
    const sent = page.waitForResponse((r) => r.url().endsWith(`/api/tasks/${task.id}/comments`) && r.request().method() === 'POST');
    await dialog.getByRole('button', { name: 'Yorum gönder' }).click();
    expect((await sent).status()).toBe(201);
    const item = dialog.locator('.task-comments li', { hasText: text });
    await expect(item).toContainText(SEED.member.name);

    await page.reload();
    await page.getByRole('button', { name: task.title, exact: true }).click();
    await expect(page.getByRole('dialog').locator('.task-comments li', { hasText: text })).toContainText(SEED.member.name);
  });

  test('R-YRM-03: açıklama ve yorumdaki HTML/script düz metin gösterilir, çalışmaz', async ({ page }) => {
    await login(page, SEED.member.email);
    await page.goto(BOARD_URL);
    await page.getByRole('button', { name: task.title, exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.locator('.task-text').first()).toContainText(PAYLOAD);

    await dialog.getByLabel('Yorum yaz').fill(PAYLOAD);
    await dialog.getByRole('button', { name: 'Yorum gönder' }).click();
    await expect(dialog.locator('.task-comments li .task-text')).toHaveText(PAYLOAD);

    await expect(dialog.locator('img, script')).toHaveCount(0);
    expect(await page.evaluate(() => window.__xss)).toBeUndefined();
  });
});
