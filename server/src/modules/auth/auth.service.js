'use strict';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config');
const AppError = require('../../utils/AppError');
const defaultRepository = require('../users/users.repository');

const DEFAULT_ROLE = 'Ekip Üyesi';

/**
 * Kimlik doğrulama iş kuralları. Repository dışarıdan verilebilir (birim testlerde sahte repo).
 */
function createAuthService(usersRepository = defaultRepository) {
  function signToken(user) {
    return jwt.sign({ sub: String(user.id), role: user.role }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
  }

  function toPublic(user) {
    const { password_hash: _omit, ...rest } = user;
    return rest;
  }

  return {
    signToken,

    async register({ name, email, password }) {
      const existing = await usersRepository.findByEmailWithPassword(email);
      if (existing) throw AppError.conflict('Bu e-posta adresiyle kayıtlı bir kullanıcı zaten var.');

      const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
      let user;
      try {
        user = await usersRepository.create({ name, email, passwordHash, roleName: DEFAULT_ROLE });
      } catch (e) {
        // Eşzamanlı iki kayıtta UNIQUE ihlali
        if (e.code === '23505') throw AppError.conflict('Bu e-posta adresiyle kayıtlı bir kullanıcı zaten var.');
        throw e;
      }
      return { user, token: signToken(user) };
    },

    async login({ email, password }) {
      const user = await usersRepository.findByEmailWithPassword(email);
      // Kullanıcı yoksa da aynı mesaj: hangi alanın yanlış olduğu belli edilmez (TS-AUTH-05)
      const ok = user ? await bcrypt.compare(password, user.password_hash) : false;
      if (!ok) throw AppError.unauthorized('Kimlik doğrulama başarısız: e-posta veya şifre hatalı.');
      const publicUser = toPublic(user);
      return { user: publicUser, token: signToken(publicUser) };
    },

    async me(userId) {
      const user = await usersRepository.findById(userId);
      if (!user) throw AppError.unauthorized('Kullanıcı artık mevcut değil.');
      return user;
    },
  };
}

module.exports = { createAuthService, DEFAULT_ROLE };
