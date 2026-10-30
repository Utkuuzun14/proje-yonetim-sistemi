'use strict';
const { Router } = require('express');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const asyncHandler = require('../../utils/asyncHandler');
const { createProjectSchema, updateProjectSchema, addMemberSchema } = require('./projects.schemas');
const controller = require('./projects.controller');

const router = Router();

// Tüm proje uç noktaları oturum ister; authorize() izinleri yükler (görünürlük kuralı için)
router.use(authenticate, authorize());

router.get('/', asyncHandler(controller.list));
router.post('/', authorize('project:create'), validate(createProjectSchema), asyncHandler(controller.create));
router.get('/:id', asyncHandler(controller.get));
router.patch('/:id', authorize('project:update'), validate(updateProjectSchema), asyncHandler(controller.update));
router.delete('/:id', authorize('project:delete'), asyncHandler(controller.remove));
router.post('/:id/members', authorize('project:update'), validate(addMemberSchema), asyncHandler(controller.addMember));
router.delete('/:id/members/:userId', authorize('project:update'), asyncHandler(controller.removeMember));

module.exports = router;
