'use strict';
const { Router } = require('express');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const asyncHandler = require('../../utils/asyncHandler');
const { createUserSchema, updateRoleSchema } = require('./users.schemas');
const controller = require('./users.controller');

const router = Router();

router.use(authenticate);
// Kullanıcı listesi ve yönetimi yalnızca Yönetici'ye açık (SRS FR-03, #104)
router.get('/', authorize('user:manage'), asyncHandler(controller.list));
router.post('/', authorize('user:manage'), validate(createUserSchema), asyncHandler(controller.create));
router.get('/:id', asyncHandler(controller.getById));
router.patch('/:id/role', authorize('user:manage'), validate(updateRoleSchema), asyncHandler(controller.updateRole));

module.exports = router;
