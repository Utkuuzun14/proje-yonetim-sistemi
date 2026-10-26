'use strict';
const usersRepository = require('./users.repository');
const AppError = require('../../utils/AppError');

module.exports = {
  async list(req, res) {
    const users = await usersRepository.list();
    res.json({ data: users });
  },

  async getById(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw AppError.badRequest('Geçersiz kullanıcı kimliği.');
    const user = await usersRepository.findById(id);
    if (!user) throw AppError.notFound('Kullanıcı bulunamadı.');
    res.json({ data: user });
  },
};
