'use strict';
const { createAuthorize } = require('../../src/middleware/authorize');

function run(middleware, user) {
  return new Promise((resolve) => {
    const req = { user };
    middleware(req, {}, (err) => resolve({ err, req }));
  });
}

const roles = {
  1: { name: 'Yönetici', permissions: { 'project:create': true, 'user:manage': true } },
  2: { name: 'Ekip Üyesi', permissions: { 'project:view': true } },
  3: { name: null, permissions: null }, // rolü silinmiş kullanıcı
};
const repo = { findRoleWithPermissions: jest.fn(async (id) => roles[id] || null) };
const authorize = createAuthorize(repo);

describe('authorize (birim)', () => {
  beforeEach(() => repo.findRoleWithPermissions.mockClear());

  test('izni olan geçer; rol ve izinler req.user\'a yüklenir', async () => {
    const { err, req } = await run(authorize('project:create'), { id: 1, role: 'eski-token-rolü' });
    expect(err).toBeUndefined();
    expect(req.user).toMatchObject({ role: 'Yönetici', permissions: roles[1].permissions });
  });

  test('izni olmayan → 403 FORBIDDEN', async () => {
    const { err } = await run(authorize('project:create'), { id: 2 });
    expect(err).toMatchObject({ status: 403, code: 'FORBIDDEN' });
  });

  test('birden fazla izin istenirse hepsi gerekir', async () => {
    expect((await run(authorize('project:create', 'user:manage'), { id: 1 })).err).toBeUndefined();
    expect((await run(authorize('project:create', 'project:delete'), { id: 1 })).err).toMatchObject({ status: 403 });
  });

  test('argümansız: yalnızca izinleri yükler, her rol geçer', async () => {
    expect((await run(authorize(), { id: 2 })).err).toBeUndefined();
  });

  test('rolü olmayan kullanıcının izni yok → 403', async () => {
    expect((await run(authorize('project:view'), { id: 3 })).err).toMatchObject({ status: 403 });
  });

  test('silinmiş kullanıcı → 401', async () => {
    expect((await run(authorize(), { id: 99 })).err).toMatchObject({ status: 401 });
  });

  test('izinler zaten yüklüyse VT tekrar sorgulanmaz', async () => {
    await run(authorize('project:create'), { id: 1, permissions: { 'project:create': true } });
    expect(repo.findRoleWithPermissions).not.toHaveBeenCalled();
  });
});
