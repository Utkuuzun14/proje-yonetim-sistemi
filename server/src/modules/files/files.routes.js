'use strict';
const { Router } = require('express');
const { z } = require('zod');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const asyncHandler = require('../../utils/asyncHandler');
const upload = require('./files.upload');
const controller = require('./files.controller');

const MAX_INT = 2147483647;
const optionalTaskId = (field) =>
  z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.coerce
      .number({ error: `${field} sayı olmalıdır.` })
      .int(`Geçersiz görev kimliği (${field}).`)
      .positive(`Geçersiz görev kimliği (${field}).`)
      .max(MAX_INT, `Geçersiz görev kimliği (${field}).`)
      .optional(),
  );
const listQuery = z.object({ taskId: optionalTaskId('taskId') });
// multipart metin alanları: yalnız task_id tanınır, diğerleri yok sayılır
const uploadFields = z.object({ task_id: optionalTaskId('task_id') }).transform((v) => ({ taskId: v.task_id }));

// /api/projects/:id/files
const projectFiles = Router({ mergeParams: true });
projectFiles.use(authenticate, authorize());
projectFiles.get('/', validate(listQuery, 'query'), asyncHandler(controller.list));
projectFiles.post(
  '/',
  asyncHandler(controller.checkProjectAccess), // önce yetki, sonra gövde: üye olmayanın dosyası okunmaz
  upload,
  validate(uploadFields),
  asyncHandler(controller.upload),
);

// /api/files/:id/download — statik dizin yok, her indirme yetki denetiminden geçer (FR-14.1)
const files = Router();
files.use(authenticate, authorize());
files.get('/:id/download', asyncHandler(controller.download));

module.exports = { projectFiles, files };
