'use strict';
const db = require('../../db/pool');

const PUBLIC_COLUMNS = 'u.id, u.name, u.email, r.name AS role, u.created_at';

module.exports = {
  async findByEmailWithPassword(email) {
    const { rows } = await db.query(
      `SELECT u.id, u.name, u.email, u.password_hash, r.name AS role
         FROM users u LEFT JOIN roles r ON r.id = u.role_id
        WHERE lower(u.email) = lower($1)`,
      [email],
    );
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await db.query(
      `SELECT ${PUBLIC_COLUMNS} FROM users u LEFT JOIN roles r ON r.id = u.role_id WHERE u.id = $1`,
      [id],
    );
    return rows[0] || null;
  },

  async list() {
    const { rows } = await db.query(
      `SELECT ${PUBLIC_COLUMNS} FROM users u LEFT JOIN roles r ON r.id = u.role_id ORDER BY u.id`,
    );
    return rows;
  },

  async create({ name, email, passwordHash, roleName }) {
    const { rows } = await db.query(
      `WITH inserted AS (
         INSERT INTO users (role_id, name, email, password_hash)
         VALUES ((SELECT id FROM roles WHERE name = $4), $1, $2, $3)
         RETURNING *
       )
       SELECT i.id, i.name, i.email, r.name AS role, i.created_at
         FROM inserted i LEFT JOIN roles r ON r.id = i.role_id`,
      [name, email, passwordHash, roleName],
    );
    return rows[0];
  },

  /**
   * Kullanıcının rolünü günceller (Sprint 3 - US-02 / Issue #44 & #45).
   */
  async updateRole(userId, roleName) {
    const { rows } = await db.query(
      `UPDATE users
          SET role_id = (SELECT id FROM roles WHERE name = $2)
        WHERE id = $1
        RETURNING id`,
      [userId, roleName],
    );
    if (rows.length === 0) return null;
    return await this.findById(userId);
  },

  /**
   * Sistemdeki tüm rolleri ve izin matrisini listeler.
   */
  async listRoles() {
    const { rows } = await db.query('SELECT id, name, permissions FROM roles ORDER BY id ASC');
    return rows;
  },

  /**
   * Belirli bir rolün izin tanımlarını döner.
   */
  async getRolePermissions(roleName) {
    const { rows } = await db.query('SELECT permissions FROM roles WHERE name = $1', [roleName]);
    return rows[0] ? rows[0].permissions : null;
  },

  /**
   * Kullanıcıyı rol ve izinleriyle birlikte getirir (RBAC yetkilendirmesi için).
   */
  async findByIdWithPermissions(id) {
    const { rows } = await db.query(
      `SELECT u.id, u.name, u.email, r.name AS role, r.permissions, u.created_at
         FROM users u
         LEFT JOIN roles r ON r.id = u.role_id
        WHERE u.id = $1`,
      [id],
    );
    return rows[0] || null;
  },
};
