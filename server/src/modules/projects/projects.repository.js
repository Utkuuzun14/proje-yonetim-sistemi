'use strict';
const db = require('../../db/pool');

const COLUMNS = 'p.id, p.name, p.description, p.start_date, p.end_date, p.owner_id, p.created_at';
const UPDATABLE = ['name', 'description', 'start_date', 'end_date'];

module.exports = {
  async listAll() {
    const { rows } = await db.query(`SELECT ${COLUMNS} FROM projects p ORDER BY p.id`);
    return rows;
  },

  async listForMember(userId) {
    const { rows } = await db.query(
      `SELECT ${COLUMNS} FROM projects p
         JOIN project_members m ON m.project_id = p.id
        WHERE m.user_id = $1
        ORDER BY p.id`,
      [userId],
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await db.query(`SELECT ${COLUMNS} FROM projects p WHERE p.id = $1`, [id]);
    return rows[0] || null;
  },

  async isMember(projectId, userId) {
    const { rowCount } = await db.query('SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2', [
      projectId,
      userId,
    ]);
    return rowCount > 0;
  },

  async listMembers(projectId) {
    const { rows } = await db.query(
      `SELECT u.id, u.name, u.email, r.name AS role, m.joined_at
         FROM project_members m
         JOIN users u ON u.id = m.user_id
         LEFT JOIN roles r ON r.id = u.role_id
        WHERE m.project_id = $1
        ORDER BY u.id`,
      [projectId],
    );
    return rows;
  },

  /** Projeyi oluşturur ve oluşturanı üye olarak ekler (tek işlem). */
  async createWithOwner({ name, description, start_date, end_date }, ownerId) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        `INSERT INTO projects (owner_id, name, description, start_date, end_date)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, description, start_date, end_date, owner_id, created_at`,
        [ownerId, name, description ?? null, start_date ?? null, end_date ?? null],
      );
      await client.query('INSERT INTO project_members (project_id, user_id) VALUES ($1, $2)', [rows[0].id, ownerId]);
      await client.query('COMMIT');
      return rows[0];
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  /** Yalnızca gönderilen alanları günceller. */
  async update(id, changes) {
    const keys = UPDATABLE.filter((k) => k in changes);
    const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const { rows } = await db.query(
      `UPDATE projects p SET ${sets} WHERE p.id = $1 RETURNING ${COLUMNS}`,
      [id, ...keys.map((k) => changes[k])],
    );
    return rows[0] || null;
  },

  /** Görevler, üyelikler vb. ON DELETE CASCADE ile birlikte silinir. */
  async remove(id) {
    const { rowCount } = await db.query('DELETE FROM projects WHERE id = $1', [id]);
    return rowCount > 0;
  },

  async addMember(projectId, userId) {
    const { rows } = await db.query(
      `INSERT INTO project_members (project_id, user_id) VALUES ($1, $2)
       RETURNING project_id, user_id, joined_at`,
      [projectId, userId],
    );
    return rows[0];
  },

  async removeMember(projectId, userId) {
    const { rowCount } = await db.query('DELETE FROM project_members WHERE project_id = $1 AND user_id = $2', [
      projectId,
      userId,
    ]);
    return rowCount > 0;
  },
};
