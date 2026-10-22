'use strict';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createAuthService, DEFAULT_ROLE } = require('../../src/modules/auth/auth.service');

function fakeRepo(users = []) {
  const store = [...users];
  return {
    store,
    findByEmailWithPassword: jest.fn(async (email) => store.find((u) => u.email === email) || null),
    findById: jest.fn(async (id) => {
      const u = store.find((x) => x.id === id);
      if (!u) return null;
      const { password_hash: _p, ...rest } = u;
      return rest;
    }),
    create: jest.fn(async ({ name, email, passwordHash, roleName }) => {
      const u = { id: store.length + 1, name, email, password_hash: passwordHash, role: roleName };
      store.push(u);
      const { password_hash: _p, ...rest } = u;
      return rest;
    }),
  };
}

describe('auth.service (birim)', () => {
  test('register: şifreyi düz metin değil bcrypt özeti olarak saklar ve varsayılan rolü verir', async () => {
    const repo = fakeRepo();
    const service = createAuthService(repo);
    const { user, token } = await service.register({ name: 'Ayşe', email: 'ayse@x.com', password: 'Gizli1234' });

    const saved = repo.store[0];
    expect(saved.password_hash).not.toBe('Gizli1234');
    expect(await bcrypt.compare('Gizli1234', saved.password_hash)).toBe(true);
    expect(user.role).toBe(DEFAULT_ROLE);
    expect(user).not.toHaveProperty('password_hash');
    expect(typeof token).toBe('string');
  });

  test('register: kayıtlı e-posta → 409 CONFLICT', async () => {
    const repo = fakeRepo([{ id: 1, email: 'var@x.com', password_hash: 'h' }]);
    const service = createAuthService(repo);
    await expect(service.register({ name: 'A', email: 'var@x.com', password: 'Gizli1234' })).rejects.toMatchObject({
      status: 409,
      code: 'CONFLICT',
    });
    expect(repo.create).not.toHaveBeenCalled();
  });

  test('register: eşzamanlı kayıtta UNIQUE ihlali (23505) → 409', async () => {
    const repo = fakeRepo();
    repo.create.mockRejectedValueOnce(Object.assign(new Error('dup'), { code: '23505' }));
    const service = createAuthService(repo);
    await expect(service.register({ name: 'A', email: 'a@x.com', password: 'Gizli1234' })).rejects.toMatchObject({
      status: 409,
    });
  });

  test('login: doğru şifre → token içinde kullanıcı id ve rol', async () => {
    const hash = await bcrypt.hash('Password123!', 4);
    const service = createAuthService(fakeRepo([{ id: 7, name: 'Utku', email: 'u@x.com', password_hash: hash, role: 'Ekip Üyesi' }]));
    const { user, token } = await service.login({ email: 'u@x.com', password: 'Password123!' });

    const payload = jwt.decode(token);
    expect(payload.sub).toBe('7');
    expect(payload.role).toBe('Ekip Üyesi');
    expect(user).not.toHaveProperty('password_hash');
  });

  test('login: yanlış şifre ve olmayan kullanıcı aynı mesajı döner (bilgi sızdırmaz)', async () => {
    const hash = await bcrypt.hash('Password123!', 4);
    const service = createAuthService(fakeRepo([{ id: 1, email: 'u@x.com', password_hash: hash, role: 'Yönetici' }]));

    const wrongPw = await service.login({ email: 'u@x.com', password: 'yanlis' }).catch((e) => e);
    const noUser = await service.login({ email: 'yok@x.com', password: 'yanlis' }).catch((e) => e);
    expect(wrongPw).toMatchObject({ status: 401, code: 'UNAUTHORIZED' });
    expect(noUser.message).toBe(wrongPw.message);
  });

  test('me: silinmiş kullanıcı → 401', async () => {
    const service = createAuthService(fakeRepo());
    await expect(service.me(99)).rejects.toMatchObject({ status: 401 });
  });
});
