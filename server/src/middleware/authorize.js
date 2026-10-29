'use strict';
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const defaultRepository = require('../modules/users/users.repository');

/**
 * Rol bazlı yetki (RBAC, #44). authenticate'ten sonra kullanılır.
 * Kullanıcının rolü ve izinleri her istekte VT'den (roles.permissions) okunur; böylece rol değişikliği
 * token yenilenmeden hemen geçerli olur. req.user.role ve req.user.permissions doldurulur.
 *
 *   authorize()                  → yalnızca izinleri yükler
 *   authorize('project:create')  → izin yoksa 403 FORBIDDEN
 */
function createAuthorize(usersRepository = defaultRepository) {
  return (...required) =>
    asyncHandler(async (req, res, next) => {
      if (!req.user.permissions) {
        const role = await usersRepository.findRoleWithPermissions(req.user.id);
        if (!role) throw AppError.unauthorized('Kullanıcı artık mevcut değil.');
        req.user.role = role.name;
        req.user.permissions = role.permissions || {};
      }
      if (!required.every((p) => req.user.permissions[p] === true)) throw AppError.forbidden();
      next();
    });
}

module.exports = createAuthorize();
module.exports.createAuthorize = createAuthorize;
