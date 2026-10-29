'use strict';
const db = require('../../db/pool');

/**
 * Projects Repository — Sprint 3 (Issue #45)
 * Sorumlu: Buğra Durmuş (Veri Tabanı Yöneticisi / DevOps & Backend Destek)
 *
 * Mustafa'nın Proje API'si ve RBAC yetkilendirmesi (#44) için veri tabanı sorgu katmanı.
 */

const PROJECT_COLUMNS = `
  p.id,
  p.name,
  p.description,
  p.start_date,
  p.end_date,
  p.created_at,
  p.owner_id,
  u.name AS owner_name,
  u.email AS owner_email,
  (SELECT COUNT(*)::int FROM project_members pm WHERE pm.project_id = p.id) AS member_count
`;

module.exports = {
  /**
   * Yeni proje oluşturur ve projeyi açan kullanıcıyı (owner) otomatik olarak üye yapar.
   */
  async create({ name, description = null, startDate = null, endDate = null, ownerId = null }) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const projectRes = await client.query(
        `INSERT INTO projects (name, description, start_date, end_date, owner_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, description, start_date, end_date, owner_id, created_at`,
        [name, description, startDate, endDate, ownerId],
      );
      const project = projectRes.rows[0];

      // Proje sahibini otomatik olarak üye yap (varsa)
      if (ownerId) {
        await client.query(
          `INSERT INTO project_members (project_id, user_id)
           VALUES ($1, $2)
           ON CONFLICT (project_id, user_id) DO NOTHING`,
          [project.id, ownerId],
        );
      }

      await client.query('COMMIT');

      return await this.findById(project.id);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * ID'ye göre proje detayını getirir.
   */
  async findById(id) {
    const { rows } = await db.query(
      `SELECT ${PROJECT_COLUMNS}
         FROM projects p
         LEFT JOIN users u ON u.id = p.owner_id
        WHERE p.id = $1`,
      [id],
    );
    return rows[0] || null;
  },

  /**
   * Projeleri listeler.
   * Yönetici ise tüm projeleri; normal üye ise sadece dahil olduğu veya sahibi olduğu projeleri döner.
   */
  async list({ userId = null, isAdmin = false } = {}) {
    if (isAdmin || !userId) {
      const { rows } = await db.query(
        `SELECT ${PROJECT_COLUMNS}
           FROM projects p
           LEFT JOIN users u ON u.id = p.owner_id
          ORDER BY p.created_at DESC`,
      );
      return rows;
    }

    const { rows } = await db.query(
      `SELECT ${PROJECT_COLUMNS}
         FROM projects p
         LEFT JOIN users u ON u.id = p.owner_id
        WHERE p.owner_id = $1
           OR EXISTS (
                SELECT 1 FROM project_members pm
                 WHERE pm.project_id = p.id AND pm.user_id = $1
              )
        ORDER BY p.created_at DESC`,
      [userId],
    );
    return rows;
  },

  /**
   * Proje bilgilerini günceller.
   */
  async update(id, { name, description, startDate, endDate }) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(name);
    }
    if (description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(description);
    }
    if (startDate !== undefined) {
      fields.push(`start_date = $${idx++}`);
      values.push(startDate);
    }
    if (endDate !== undefined) {
      fields.push(`end_date = $${idx++}`);
      values.push(endDate);
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    values.push(id);
    const { rows } = await db.query(
      `UPDATE projects
          SET ${fields.join(', ')}
        WHERE id = $${idx}
        RETURNING id`,
      values,
    );

    if (rows.length === 0) return null;
    return await this.findById(id);
  },

  /**
   * Projeyi siler (CASCADE ile üyelikler ve görevler temizlenir).
   */
  async delete(id) {
    const { rowCount } = await db.query('DELETE FROM projects WHERE id = $1', [id]);
    return rowCount > 0;
  },

  /**
   * Projeye üye ekler.
   */
  async addMember(projectId, userId) {
    await db.query(
      `INSERT INTO project_members (project_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (project_id, user_id) DO NOTHING`,
      [projectId, userId],
    );

    const { rows } = await db.query(
      `SELECT u.id, u.name, u.email, r.name AS role, pm.joined_at
         FROM project_members pm
         JOIN users u ON u.id = pm.user_id
         LEFT JOIN roles r ON r.id = u.role_id
        WHERE pm.project_id = $1 AND pm.user_id = $2`,
      [projectId, userId],
    );
    return rows[0] || null;
  },

  /**
   * Projeden üye çıkarır.
   */
  async removeMember(projectId, userId) {
    const { rowCount } = await db.query(
      `DELETE FROM project_members WHERE project_id = $1 AND user_id = $2`,
      [projectId, userId],
    );
    return rowCount > 0;
  },

  /**
   * Projenin üyelerini listeler.
   */
  async listMembers(projectId) {
    const { rows } = await db.query(
      `SELECT u.id, u.name, u.email, r.name AS role, pm.joined_at
         FROM project_members pm
         JOIN users u ON u.id = pm.user_id
         LEFT JOIN roles r ON r.id = u.role_id
        WHERE pm.project_id = $1
        ORDER BY pm.joined_at ASC`,
      [projectId],
    );
    return rows;
  },

  /**
   * Kullanıcının projede üye olup olmadığını kontrol eder.
   */
  async isMember(projectId, userId) {
    const { rows } = await db.query(
      `SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2`,
      [projectId, userId],
    );
    return rows.length > 0;
  },

  /**
   * Kullanıcının projenin sahibi olup olmadığını kontrol eder.
   */
  async isOwner(projectId, userId) {
    const { rows } = await db.query(
      `SELECT 1 FROM projects WHERE id = $1 AND owner_id = $2`,
      [projectId, userId],
    );
    return rows.length > 0;
  },
};
