'use strict';
const { Router } = require('express');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const asyncHandler = require('../../utils/asyncHandler');
const { createTaskSchema, updateTaskSchema, listTasksQuery, createCommentSchema } = require('./tasks.schemas');
const controller = require('./tasks.controller');

// /api/projects/:id/tasks — proje kimliği üst yoldan gelir (mergeParams)
const projectTasks = Router({ mergeParams: true });
projectTasks.use(authenticate, authorize());
projectTasks.get('/', validate(listTasksQuery, 'query'), asyncHandler(controller.list));
projectTasks.post('/', validate(createTaskSchema), asyncHandler(controller.create));

// /api/tasks/:id …
const tasks = Router();
tasks.use(authenticate, authorize());
tasks.patch('/:id', validate(updateTaskSchema), asyncHandler(controller.update));
tasks.delete('/:id', authorize('task:delete'), asyncHandler(controller.remove));
tasks.get('/:id/history', asyncHandler(controller.history));
tasks.get('/:id/comments', asyncHandler(controller.listComments));
tasks.post('/:id/comments', validate(createCommentSchema), asyncHandler(controller.addComment));

module.exports = { projectTasks, tasks };
