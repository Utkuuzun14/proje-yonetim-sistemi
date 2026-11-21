'use strict';
const { createFilesService } = require('./files.service');
const parseId = require('../../utils/parseId');

const filesService = createFilesService();
const projectId = (req) => parseId(req.params.id, 'Geçersiz proje kimliği.');
const fileId = (req) => parseId(req.params.id, 'Geçersiz dosya kimliği.');

module.exports = {
  /** Yüklemeden önce: üye olmayanın dosyası hiç okunmaz. */
  async checkProjectAccess(req, res, next) {
    await filesService.assertProjectAccess(req.user, projectId(req));
    next();
  },

  async list(req, res) {
    res.json({ data: await filesService.list(req.user, projectId(req), req.query) });
  },

  async upload(req, res) {
    const file = await filesService.upload(req.user, projectId(req), req.file, req.body);
    res.status(201).json({ data: file });
  },

  async download(req, res, next) {
    const { meta, filePath } = await filesService.openForDownload(req.user, fileId(req));
    // Her zaman ek olarak sunulur; tarayıcı içeriği sayfa olarak çalıştırmaz (helmet: nosniff)
    res.attachment(meta.name);
    res.set({ 'Content-Type': meta.type || 'application/octet-stream', 'Cache-Control': 'private, no-store' });
    res.sendFile(filePath, (err) => {
      if (err && !res.headersSent) next(err);
    });
  },
};
