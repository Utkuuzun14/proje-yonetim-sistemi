'use strict';
const { createTasksService } = require('./tasks.service');
const parseId = require('../../utils/parseId');

const tasksService = createTasksService();
const projectId = (req) => parseId(req.params.id, 'Geçersiz proje kimliği.');
const taskId = (req) => parseId(req.params.id, 'Geçersiz görev kimliği.');

module.exports = {
  async list(req, res) {
    res.json({ data: await tasksService.list(req.user, projectId(req), req.query) });
  },

  async create(req, res) {
    res.status(201).json({ data: await tasksService.create(req.user, projectId(req), req.body) });
  },

  async update(req, res) {
    res.json({ data: await tasksService.update(req.user, taskId(req), req.body) });
  },

  async remove(req, res) {
    await tasksService.remove(taskId(req));
    res.status(204).end();
  },

  async history(req, res) {
    res.json({ data: await tasksService.history(req.user, taskId(req)) });
  },

  async listComments(req, res) {
    res.json({ data: await tasksService.listComments(req.user, taskId(req)) });
  },

  async addComment(req, res) {
    res.status(201).json({ data: await tasksService.addComment(req.user, taskId(req), req.body.content) });
  },
};
