'use strict';
const db = require('../../db/pool');

// Geciken: bitiş tarihi bugünden önce ve henüz Done değil; bitiş tarihi olmayan görev gecikmez (#143)
const OVERDUE = "t.end_date < CURRENT_DATE AND t.status <> 'Done'";

module.exports = {
  /** Proje geneli durum sayıları; tek sorguda (FILTER ile). */
  async projectTotals(projectId) {
    const { rows } = await db.query(
      `SELECT COUNT(*)::int                                          AS total,
              COUNT(*) FILTER (WHERE t.status = 'To Do')::int        AS todo,
              COUNT(*) FILTER (WHERE t.status = 'In Progress')::int  AS in_progress,
              COUNT(*) FILTER (WHERE t.status = 'Done')::int         AS done,
              COUNT(*) FILTER (WHERE ${OVERDUE})::int                AS overdue,
              COUNT(*) FILTER (WHERE t.assignee_id IS NULL)::int     AS unassigned
         FROM tasks t
        WHERE t.project_id = $1`,
      [projectId],
    );
    return rows[0];
  },

  /**
   * Kişi bazlı satırlar: projenin üyeleri (görevi olmasa da) ve projede görevi olup artık üye olmayanlar.
   * Böylece kişi satırlarının toplamı + atanmamış = proje toplamı olur. Ad sırasıyla (deterministik).
   */
  async memberBreakdown(projectId) {
    const { rows } = await db.query(
      `WITH people AS (
              SELECT user_id FROM project_members WHERE project_id = $1
              UNION
              SELECT assignee_id FROM tasks WHERE project_id = $1 AND assignee_id IS NOT NULL
            )
       SELECT u.id AS user_id, u.name,
              COUNT(t.id)::int                                          AS assigned,
              COUNT(t.id) FILTER (WHERE t.status = 'To Do')::int        AS todo,
              COUNT(t.id) FILTER (WHERE t.status = 'In Progress')::int  AS in_progress,
              COUNT(t.id) FILTER (WHERE t.status = 'Done')::int         AS done,
              COUNT(t.id) FILTER (WHERE ${OVERDUE})::int                AS overdue
         FROM people p
         JOIN users u ON u.id = p.user_id
         LEFT JOIN tasks t ON t.project_id = $1 AND t.assignee_id = u.id
        GROUP BY u.id, u.name
        ORDER BY u.name, u.id`,
      [projectId],
    );
    return rows;
  },

  /**
   * Tarih aralığı (iki uç dahil, gün bazında):
   *  created   — created_at bu aralıkta olan görevler
   *  completed — aralıkta Done'a geçişi olan farklı görevler (task_status_history)
   */
  async rangeCounts(projectId, from, to) {
    const { rows } = await db.query(
      `SELECT
         (SELECT COUNT(*)::int FROM tasks t
           WHERE t.project_id = $1 AND t.created_at::date BETWEEN $2::date AND $3::date) AS created,
         (SELECT COUNT(DISTINCT h.task_id)::int
            FROM task_status_history h JOIN tasks t ON t.id = h.task_id
           WHERE t.project_id = $1 AND h.new_status = 'Done'
             AND h.changed_at::date BETWEEN $2::date AND $3::date)                       AS completed`,
      [projectId, from, to],
    );
    return rows[0];
  },
};
