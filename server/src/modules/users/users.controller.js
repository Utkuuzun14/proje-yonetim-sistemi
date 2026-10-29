'use strict';
const usersRepository = require('./users.repository');
const { createUsersService } = require('./users.service');
const AppError = require('../../utils/AppError');
const parseId = require('../../utils/parseId');

const usersService = createUsersService();

module.exports = {
  async list(req, res) {
    const users = await usersRepository.list();
    res.json({ data: users });
  },

  async getById(req, res) {
    const id = parseId(req.params.id, 'Geçersiz kullanıcı kimliği.');
    const user = await usersRepository.findById(id);
    if (!user) throw AppError.notFound('Kullanıcı bulunamadı.');
    res.json({ data: user });
  },

  async create(req, res) {
    const user = await usersService.create(req.body);
    res.status(201).json({ data: user });
  },

  async updateRole(req, res) {
    const id = parseId(req.params.id, 'Geçersiz kullanıcı kimliği.');
    const user = await usersService.changeRole(req.user.id, id, req.body.role);
    res.json({ data: user });
  },
};
