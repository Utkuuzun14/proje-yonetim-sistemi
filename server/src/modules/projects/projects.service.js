'use strict';
const AppError = require('../../utils/AppError');
const defaultProjectsRepository = require('./projects.repository');
const defaultUsersRepository = require('../users/users.repository');
const { datesInOrder, DATE_ORDER_MESSAGE } = require('./projects.schemas');

const NOT_FOUND = 'Proje bulunamadı.';

/** Proje yönetme yetkisi olan (Yönetici) tüm projeleri görür; diğerleri yalnız üyesi olduklarını (SRS FR-03). */
const seesAllProjects = (user) => user.permissions?.['project:update'] === true;

/**
 * Proje ve üyelik iş kuralları (#44). user = req.user ({ id, role, permissions }).
 * Repository'ler dışarıdan verilebilir (birim testlerde sahte repo).
 */
function createProjectsService(projects = defaultProjectsRepository, users = defaultUsersRepository) {
  async function findOr404(id) {
    const project = await projects.findById(id);
    if (!project) throw AppError.notFound(NOT_FOUND);
    return project;
  }

  return {
    async list(user) {
      return seesAllProjects(user) ? projects.listAll() : projects.listForMember(user.id);
    },

    async get(user, id) {
      const project = await projects.findById(id);
      // Üye olmayan için de 404: projenin varlığı sızdırılmaz (TS-ROL-04)
      if (!project || (!seesAllProjects(user) && !(await projects.isMember(id, user.id)))) {
        throw AppError.notFound(NOT_FOUND);
      }
      return { ...project, members: await projects.listMembers(id) };
    },

    async create(user, input) {
      return projects.createWithOwner(input, user.id);
    },

    async update(id, changes) {
      const current = await findOr404(id);
      const start = 'start_date' in changes ? changes.start_date : current.start_date;
      const end = 'end_date' in changes ? changes.end_date : current.end_date;
      if (!datesInOrder(start, end)) {
        throw AppError.badRequest('Gönderilen veriler geçersiz.', [{ field: 'end_date', message: DATE_ORDER_MESSAGE }]);
      }
      return projects.update(id, changes);
    },

    async remove(id) {
      if (!(await projects.remove(id))) throw AppError.notFound(NOT_FOUND);
    },

    async addMember(projectId, userId) {
      await findOr404(projectId);
      if (!(await users.findById(userId))) throw AppError.notFound('Kullanıcı bulunamadı.');
      try {
        return await projects.addMember(projectId, userId);
      } catch (e) {
        if (e.code === '23505') throw AppError.conflict('Kullanıcı zaten bu projenin üyesi.');
        throw e;
      }
    },

    async removeMember(projectId, userId) {
      await findOr404(projectId);
      if (!(await projects.removeMember(projectId, userId))) throw AppError.notFound('Kullanıcı bu projenin üyesi değil.');
    },
  };
}

module.exports = { createProjectsService, seesAllProjects };
