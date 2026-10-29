'use strict';
const bcrypt = require('bcryptjs');
const config = require('../../config');
const AppError = require('../../utils/AppError');
const defaultRepository = require('./users.repository');

/** Kullanıcı yönetimi iş kuralları (Yönetici, #44). */
function createUsersService(usersRepository = defaultRepository) {
  return {
    async create({ name, email, password, role }) {
      const existing = await usersRepository.findByEmailWithPassword(email);
      if (existing) throw AppError.conflict('Bu e-posta adresiyle kayıtlı bir kullanıcı zaten var.');

      const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
      try {
        return await usersRepository.create({ name, email, passwordHash, roleName: role });
      } catch (e) {
        if (e.code === '23505') throw AppError.conflict('Bu e-posta adresiyle kayıtlı bir kullanıcı zaten var.');
        throw e;
      }
    },

    async changeRole(actorId, userId, role) {
      // Yönetici kendi rolünü düşürüp sistemi yöneticisiz bırakamasın
      if (actorId === userId) throw AppError.badRequest('Kendi rolünüzü değiştiremezsiniz.');
      const user = await usersRepository.updateRole(userId, role);
      if (!user) throw AppError.notFound('Kullanıcı bulunamadı.');
      return user;
    },
  };
}

module.exports = { createUsersService };
