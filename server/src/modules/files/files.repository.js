'use strict';
const db = require('../../db/pool');

// storage_path bilerek yok: depolama anahtarı istemciye hiç dönmez. size BIGINT → sayı (10 MB sınırı INT'e sığar).
const PUBLIC_COLUMNS = 'f.id, f.project_id, f.task_id, f.name, f.type, f.size::integer AS size, f.uploader_id, f.uploaded_at';

module.exports = {
  async listByProject(projectId, { taskId } = {}) {
    const params = [projectId];
    let where = 'f.project_id = $1';
    if (taskId) {
      params.push(taskId);
      where += ' AND f.task_id = $2';
    }
    const { rows } = await db.query(
      `SELECT ${PUBLIC_COLUMNS} FROM files f WHERE ${where} ORDER BY f.uploaded_at DESC, f.id DESC`,
      params,
    );
    return rows;
  },

  /** İndirme için depolama anahtarıyla birlikte döner; yalnız sunucu içinde kullanılır. */
  async findWithStorage(id) {
    const { rows } = await db.query(`SELECT ${PUBLIC_COLUMNS}, f.storage_path FROM files f WHERE f.id = $1`, [id]);
    return rows[0] || null;
  },

  async create({ projectId, taskId, uploaderId, name, type, size, storageKey }) {
    const { rows } = await db.query(
      `INSERT INTO files AS f (project_id, task_id, uploader_id, name, type, size, storage_path)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${PUBLIC_COLUMNS}`,
      [projectId, taskId ?? null, uploaderId, name, type, size, storageKey],
    );
    return rows[0];
  },
};
