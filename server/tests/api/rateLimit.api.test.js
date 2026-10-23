'use strict';
const request = require('supertest');
const { createApp } = require('../../src/app');
const { pool } = require('../../src/db/pool');

afterAll(() => pool.end());

const login = (app, password) =>
  request(app).post('/api/auth/login').send({ email: 'hakan@sektech.com', password });

describe('Giriş deneme sınırı (SRS 4.2 · 5 başarısız deneme / 15 dk)', () => {
  test('5 başarısız denemeden sonra 6. istek 429 + Retry-After döner', async () => {
    const app = createApp(); // kendi sayaç deposu
    for (let i = 0; i < 5; i += 1) {
      expect((await login(app, 'Yanlis123!')).status).toBe(401);
    }
    const blocked = await login(app, 'Yanlis123!');
    expect(blocked.status).toBe(429);
    expect(blocked.body.error.code).toBe('TOO_MANY_REQUESTS');
    expect(blocked.headers).toHaveProperty('retry-after');

    // Sınır aşıldıktan sonra doğru şifre de pencere bitene kadar engellenir
    expect((await login(app, 'Password123!')).status).toBe(429);
  });

  test('başarılı girişler sayaca eklenmez', async () => {
    const app = createApp();
    for (let i = 0; i < 8; i += 1) {
      expect((await login(app, 'Password123!')).status).toBe(200);
    }
    expect((await login(app, 'Yanlis123!')).status).toBe(401);
  });

  test('pencere süresi dolunca tekrar denenebilir', async () => {
    const app = createApp({ loginRateLimit: { windowMs: 300, maxFailures: 2 } });
    await login(app, 'Yanlis123!');
    await login(app, 'Yanlis123!');
    expect((await login(app, 'Yanlis123!')).status).toBe(429);
    await new Promise((r) => setTimeout(r, 400));
    expect((await login(app, 'Password123!')).status).toBe(200);
  });

  test('kayıt uç noktası giriş sınırından etkilenmez', async () => {
    const app = createApp({ loginRateLimit: { maxFailures: 1 } });
    await login(app, 'Yanlis123!');
    expect((await login(app, 'Yanlis123!')).status).toBe(429);
    const res = await request(app).post('/api/auth/register').send({ name: 'Kayıt', email: `rl.${Date.now()}@sektech.com`, password: 'Gizli123!' });
    expect(res.status).toBe(201);
  });
});
