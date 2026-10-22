'use strict';
const { Router } = require('express');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/authenticate');
const asyncHandler = require('../../utils/asyncHandler');
const { registerSchema, loginSchema } = require('./auth.schemas');
const controller = require('./auth.controller');
const { createLoginRateLimit } = require('../../middleware/loginRateLimit');

function createAuthRouter(options = {}) {
  const router = Router();
  router.post('/register', validate(registerSchema), asyncHandler(controller.register));
  router.post('/login', createLoginRateLimit(options.loginRateLimit), validate(loginSchema), asyncHandler(controller.login));
  router.get('/me', authenticate, asyncHandler(controller.me));
  return router;
}

module.exports = { createAuthRouter };
