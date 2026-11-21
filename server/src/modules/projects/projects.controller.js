'use strict';
const { createProjectsService } = require('./projects.service');
const parseId = require('../../utils/parseId');

const projectsService = createProjectsService();
const projectId = (req) => parseId(req.params.id, 'Geçersiz proje kimliği.');

module.exports = {
  async list(req, res) {
    res.json({ data: await projectsService.list(req.user) });
  },

  async get(req, res) {
    res.json({ data: await projectsService.get(req.user, projectId(req)) });
  },

  async create(req, res) {
    const project = await projectsService.create(req.user, req.body);
    res.status(201).json({ data: project });
  },

  async update(req, res) {
    res.json({ data: await projectsService.update(projectId(req), req.body) });
  },

  async remove(req, res) {
    await projectsService.remove(projectId(req));
    res.status(204).end();
  },

  async addMember(req, res) {
    const member = await projectsService.addMember(projectId(req), req.body.userId);
    res.status(201).json({ data: member });
  },

  async removeMember(req, res) {
    const userId = parseId(req.params.userId, 'Geçersiz kullanıcı kimliği.');
    await projectsService.removeMember(projectId(req), userId);
    res.status(204).end();
  },
};
