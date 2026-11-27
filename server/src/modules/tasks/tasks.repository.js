'use strict';
const db = require('../../db/pool');

const COLUMNS =
  't.id, t.project_id, t.title, t.description, t.status, t.priority, t.type, t.assignee_id, ' +
  't.start_date, t.end_date, t.created_at, t.updated_at';
const UPDATABLE = ['title', 'description', 'status', 'priority', 'type', 'assignee_id', 'start_date', 'end_date'];
const HISTORY_COLUMNS = 'id, task_id, old_status, new_status, changed_by_id, changed_at';
const COMMENT_COLUMNS = 'id, task_id, author_id, content, created_at';

/** fn(client) bir transaction içinde çalışır; hata olursa her şey geri alınır (FR-08.2). */
async function inTransaction(fn) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

const insertHistory = (client, taskId, oldStatus, newStatus, userId) =>
  client.query(
    'INSERT INTO task_status_history (task_id, old_status, new_status, changed_by_id) VALUES ($1, $2, $3, $4)',
    [taskId, oldStatus, newStatus, userId],
  );

module.exports = {
  /**
   * Proje görevleri. Tarih aralığı (from/to) verilirse aralıkla kesişen görevler döner;
   * tek tarihi olan görev o güne yerleşir, hiç tarihi olmayan görev aralık sorgusunda dönmez.
   */
  async listByProject(projectId, { status, priority, type, assigneeId, from, to } = {}) {
    const where = ['t.project_id = $1'];
    const params = [projectId];
    const add = (sql, value) => {
      params.push(value);
      where.push(sql.replace('?', `$${params.length}`));
    };
    if (status) add('t.status = ?', status);
    if (priority) add('t.priority = ?', priority);
    if (type) add('t.type = ?', type);
    if (assigneeId) add('t.assignee_id = ?', assigneeId);
    if (from) add('COALESCE(t.end_date, t.start_date) >= ?', from);
    if (to) add('COALESCE(t.start_date, t.end_date) <= ?', to);

    const { rows } = await db.query(
      `SELECT ${COLUMNS} FROM tasks t WHERE ${where.join(' AND ')} ORDER BY t.id`,
      params,
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await db.query(`SELECT ${COLUMNS} FROM tasks t WHERE t.id = $1`, [id]);
    return rows[0] || null;
  },

  /** Görevi oluşturur ve ilk durum kaydını (eski durum: null) geçmişe yazar — tek işlem. */
  async create(projectId, input, userId) {
    return inTransaction(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO tasks AS t (project_id, title, description, status, priority, type, assignee_id, start_date, end_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING ${COLUMNS}`,
        [
          projectId,
          input.title,
          input.description ?? null,
          input.status,
          input.priority,
          input.type,
          input.assignee_id ?? null,
          input.start_date ?? null,
          input.end_date ?? null,
        ],
      );
      await insertHistory(client, rows[0].id, null, rows[0].status, userId);
      return rows[0];
    });
  },

  /**
   * Yalnızca gönderilen alanları günceller. Durum değiştiyse geçmiş kaydı aynı transaction'da yazılır
   * (FR-08.1/08.2); eski durum satır kilidiyle okunur, eşzamanlı iki değişiklik birbirini ezmez.
   * Görev yoksa null döner.
   */
  async update(id, changes, userId) {
    return inTransaction(async (client) => {
      const current = await client.query('SELECT status FROM tasks WHERE id = $1 FOR UPDATE', [id]);
      if (!current.rowCount) return null;
      const oldStatus = current.rows[0].status;

      const keys = UPDATABLE.filter((k) => k in changes);
      const sets = [...keys.map((k, i) => `${k} = $${i + 2}`), 'updated_at = CURRENT_TIMESTAMP'].join(', ');
      const { rows } = await client.query(
        `UPDATE tasks t SET ${sets} WHERE t.id = $1 RETURNING ${COLUMNS}`,
        [id, ...keys.map((k) => changes[k])],
      );
      if ('status' in changes && changes.status !== oldStatus) {
        await insertHistory(client, id, oldStatus, changes.status, userId);
      }
      return rows[0];
    });
  },

  /** Yorumlar ve durum geçmişi ON DELETE CASCADE ile birlikte silinir. */
  async remove(id) {
    const { rowCount } = await db.query('DELETE FROM tasks WHERE id = $1', [id]);
    return rowCount > 0;
  },

  async listHistory(taskId) {
    const { rows } = await db.query(
      `SELECT ${HISTORY_COLUMNS} FROM task_status_history WHERE task_id = $1 ORDER BY changed_at, id`,
      [taskId],
    );
    return rows;
  },

  async listComments(taskId) {
    const { rows } = await db.query(
      `SELECT ${COMMENT_COLUMNS} FROM comments WHERE task_id = $1 ORDER BY created_at, id`,
      [taskId],
    );
    return rows;
  },

  async addComment(taskId, authorId, content) {
    const { rows } = await db.query(
      `INSERT INTO comments (task_id, author_id, content) VALUES ($1, $2, $3) RETURNING ${COMMENT_COLUMNS}`,
      [taskId, authorId, content],
    );
    return rows[0];
  },
};
