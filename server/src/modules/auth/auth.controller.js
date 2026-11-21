'use strict';
const { createAuthService } = require('./auth.service');

const authService = createAuthService();

module.exports = {
  async register(req, res) {
    const result = await authService.register(req.body);
    res.status(201).json({ data: result });
  },

  async login(req, res) {
    const result = await authService.login(req.body);
    res.json({ data: result });
  },

  async me(req, res) {
    const user = await authService.me(req.user.id);
    res.json({ data: user });
  },
};
