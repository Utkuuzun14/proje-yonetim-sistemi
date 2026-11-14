// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * E2E testleri çalışan tam sisteme karşı koşar (varsayılan: docker compose → http://localhost:3000).
 * Başka bir adres için: E2E_BASE_URL=http://127.0.0.1:5173 npm test
 */
module.exports = defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: false, // testler aynı VT'yi paylaşır; sıralı ve öngörülebilir koşsun
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    locale: 'tr-TR',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {},
      },
    },
  ],
});
