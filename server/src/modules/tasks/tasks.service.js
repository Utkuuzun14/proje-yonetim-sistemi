'use strict';
const AppError = require('../../utils/AppError');
const defaultTasksRepository = require('./tasks.repository');
const defaultProjectsRepository = require('../projects/projects.repository');
const { seesAllProjects } = require('../projects/projects.service');
const { datesInOrder, DATE_ORDER_MESSAGE } = require('../projects/projects.schemas');

const TASK_NOT_FOUND = 'Görev bulunamadı.';
const PROJECT_NOT_FOUND = 'Proje bulunamadı.';

/** Her görevi düzenleyip atayabilen rol (Yönetici). Ekip Üyesi yalnız kendi görevini düzenler (Karar 10). */
const managesTasks = (user) => user.permissions?.['task:update'] === true;
const canAssign = (user) => user.permissions?.['task:assign'] === true;

const invalid = (field, message) => AppError.badRequest('Gönderilen veriler geçersiz.', [{ field, message }]);

/**
 * Görev, durum geçmişi ve yorum iş kuralları (#51). user = req.user ({ id, role, permissions }).
 *
 * Görünürlük #44'teki proje kuralıyla aynı: Yönetici tüm projeleri, diğerleri yalnız üyesi oldukları
 * projeleri görür. Üye olmayan için görev de proje de 404 döner; varlığı sızdırılmaz (TS-ROL-04).
 *
 * Yetki (#47 Karar 9–10):
 *  - Görev oluşturma: projenin her üyesi. Ekip Üyesi yalnız kendine atayabilir (atama yoksa kendine atanır).
 *  - Durum değiştirme: projenin her üyesi; değişiklik task_status_history'ye yazılır (FR-08).
 *  - Diğer alanlar: Yönetici her görevi, Ekip Üyesi yalnız kendisine atanmış görevi düzenler.
 *  - Atama değiştirme ve silme: yalnız Yönetici.
 */
function createTasksService(tasks = defaultTasksRepository, projects = defaultProjectsRepository) {
  const canSee = async (user, projectId) => seesAllProjects(user) || projects.isMember(projectId, user.id);

  async function visibleProjectOr404(user, projectId) {
    const project = await projects.findById(projectId);
    if (!project || !(await canSee(user, projectId))) throw AppError.notFound(PROJECT_NOT_FOUND);
    return project;
  }

  async function visibleTaskOr404(user, taskId) {
    const task = await tasks.findById(taskId);
    if (!task || !(await canSee(user, task.project_id))) throw AppError.notFound(TASK_NOT_FOUND);
    return task;
  }

  async function assertAssignable(projectId, assigneeId) {
    if (assigneeId !== null && assigneeId !== undefined && !(await projects.isMember(projectId, assigneeId))) {
      throw invalid('assignee_id', 'Görev yalnızca proje üyesine atanabilir.');
    }
  }

  return {
    async list(user, projectId, filters) {
      await visibleProjectOr404(user, projectId);
      return tasks.listByProject(projectId, filters);
    },

    async create(user, projectId, input) {
      await visibleProjectOr404(user, projectId);
      const data = { ...input };
      if (!canAssign(user)) {
        if (data.assignee_id === undefined || data.assignee_id === null) data.assignee_id = user.id;
        if (data.assignee_id !== user.id) throw AppError.forbidden('Görevi yalnızca kendinize atayabilirsiniz.');
      }
      await assertAssignable(projectId, data.assignee_id);
      return tasks.create(projectId, data, user.id);
    },

    async update(user, taskId, changes) {
      const task = await visibleTaskOr404(user, taskId);

      const assignmentChanges = 'assignee_id' in changes && changes.assignee_id !== task.assignee_id;
      if (assignmentChanges && !canAssign(user)) throw AppError.forbidden('Atamayı yalnızca yönetici değiştirebilir.');
      const editsDetails = Object.keys(changes).some((k) => k !== 'status');
      if (editsDetails && !managesTasks(user) && task.assignee_id !== user.id) {
        throw AppError.forbidden('Yalnızca size atanmış görevi düzenleyebilirsiniz; durumu değiştirebilirsiniz.');
      }

      const start = 'start_date' in changes ? changes.start_date : task.start_date;
      const end = 'end_date' in changes ? changes.end_date : task.end_date;
      if (!datesInOrder(start, end)) throw invalid('end_date', DATE_ORDER_MESSAGE);
      if (assignmentChanges) await assertAssignable(task.project_id, changes.assignee_id);

      const updated = await tasks.update(taskId, changes, user.id);
      if (!updated) throw AppError.notFound(TASK_NOT_FOUND); // arada silindiyse
      return updated;
    },

    async remove(taskId) {
      if (!(await tasks.remove(taskId))) throw AppError.notFound(TASK_NOT_FOUND);
    },

    async history(user, taskId) {
      await visibleTaskOr404(user, taskId);
      return tasks.listHistory(taskId);
    },

    async listComments(user, taskId) {
      await visibleTaskOr404(user, taskId);
      return tasks.listComments(taskId);
    },

    /** Yazar her zaman oturumdaki kullanıcıdır; istemcinin gönderdiği author_id yok sayılır. */
    async addComment(user, taskId, content) {
      await visibleTaskOr404(user, taskId);
      return tasks.addComment(taskId, user.id, content);
    },
  };
}

module.exports = { createTasksService };
