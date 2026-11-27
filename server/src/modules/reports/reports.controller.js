'use strict';
const { createReportsService } = require('./reports.service');
const parseId = require('../../utils/parseId');

const reportsService = createReportsService();
const projectId = (req) => parseId(req.params.id, 'Geçersiz proje kimliği.');

module.exports = {
  async progress(req, res) {
    res.json({ data: await reportsService.progress(req.user, projectId(req)) });
  },

  async range(req, res) {
    res.json({ data: await reportsService.range(req.user, projectId(req), req.query) });
  },
};
