'use strict';
const { Router } = require('express');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const asyncHandler = require('../../utils/asyncHandler');
const { rangeQuery } = require('./reports.schemas');
const controller = require('./reports.controller');

// /api/projects/:id/reports
const router = Router({ mergeParams: true });
router.use(authenticate, authorize());
router.get('/progress', asyncHandler(controller.progress));
router.get('/range', validate(rangeQuery, 'query'), asyncHandler(controller.range));

module.exports = router;
