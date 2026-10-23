'use strict';
const { Router } = require('express');
const authenticate = require('../../middleware/authenticate');
const asyncHandler = require('../../utils/asyncHandler');
const controller = require('./users.controller');

const router = Router();

// Not: Rol bazlı kısıtlama (yalnızca Yönetici) Sprint 3'te RBAC middleware'i ile eklenecek (#44).
router.get('/', authenticate, asyncHandler(controller.list));
router.get('/:id', authenticate, asyncHandler(controller.getById));

module.exports = router;
