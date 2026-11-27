'use strict';
const AppError = require('../../utils/AppError');
const defaultReportsRepository = require('./reports.repository');
const defaultProjectsRepository = require('../projects/projects.repository');
const { seesAllProjects } = require('../projects/projects.service');

const PROJECT_NOT_FOUND = 'Proje bulunamadı.';

/** done / total * 100, bir ondalık; görev yoksa 0 (NaN/Infinity/null asla dönmez, R-02). */
const completionRate = (done, total) => (total > 0 ? Math.round((done / total) * 1000) / 10 : 0);

/**
 * Raporlama iş kuralları (#65; kapsam 14 Kasım kararı: 3 rapor türü).
 *  1. Proje ilerleme yüzdesi  2. Kişi bazlı tamamlama  → GET /reports/progress
 *  3. Tarih aralıklı ilerleme                         → GET /reports/range?from&to
 *
 * Görünürlük görev modülüyle aynı (#51): Yönetici tüm projeleri, diğerleri yalnız üyesi oldukları
 * projeleri görür; üye olmayan için 404 döner, projenin varlığı sızdırılmaz (TS-ROL-04).
 * Raporlar her istekte VT'den hesaplanır; görev değişince anında güncellenir (R-04).
 */
function createReportsService(reports = defaultReportsRepository, projects = defaultProjectsRepository) {
  async function assertVisible(user, projectId) {
    const project = await projects.findById(projectId);
    if (!project || (!seesAllProjects(user) && !(await projects.isMember(projectId, user.id)))) {
      throw AppError.notFound(PROJECT_NOT_FOUND);
    }
  }

  return {
    async progress(user, projectId) {
      await assertVisible(user, projectId);
      const [totals, people] = await Promise.all([reports.projectTotals(projectId), reports.memberBreakdown(projectId)]);
      return {
        total: totals.total,
        status_counts: { 'To Do': totals.todo, 'In Progress': totals.in_progress, Done: totals.done },
        overdue: totals.overdue,
        completion_rate: completionRate(totals.done, totals.total),
        unassigned: totals.unassigned,
        members: people.map((m) => ({ ...m, completion_rate: completionRate(m.done, m.assigned) })),
      };
    },

    async range(user, projectId, { from, to }) {
      await assertVisible(user, projectId);
      const { created, completed } = await reports.rangeCounts(projectId, from, to);
      return { from, to, created, completed };
    },
  };
}

module.exports = { createReportsService, completionRate };
