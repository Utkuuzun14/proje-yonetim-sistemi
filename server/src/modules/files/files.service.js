'use strict';
const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');
const config = require('../../config');
const AppError = require('../../utils/AppError');
const defaultFilesRepository = require('./files.repository');
const defaultProjectsRepository = require('../projects/projects.repository');
const defaultTasksRepository = require('../tasks/tasks.repository');
const { seesAllProjects } = require('../projects/projects.service');
const { inspectFile } = require('./files.validation');

const FILE_NOT_FOUND = 'Dosya bulunamadı.';
const NOT_A_MEMBER = 'Bu projenin dosyalarına erişim yetkiniz yok.';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const invalid = (field, message) => AppError.badRequest('Gönderilen veriler geçersiz.', [{ field, message }]);

/**
 * Dosya yükleme/indirme iş kuralları (#58, SRS FR-13/14).
 *  - Projenin her üyesi (ve Yönetici) listeler, yükler, indirir. Üye olmayan → 403 (FR-14.2); proje yoksa 404.
 *  - Dosya diskte yalnız UUID anahtarla saklanır (FR-13.4); anahtar ve dizin istemciye dönmez.
 *  - Üyelik her indirmede yeniden denetlenir: projeden çıkarılan kişi artık indiremez.
 */
function createFilesService({
  files = defaultFilesRepository,
  projects = defaultProjectsRepository,
  tasks = defaultTasksRepository,
  uploadDir = config.uploadDir,
} = {}) {
  async function assertProjectAccess(user, projectId) {
    if (!(await projects.findById(projectId))) throw AppError.notFound('Proje bulunamadı.');
    if (!seesAllProjects(user) && !(await projects.isMember(projectId, user.id))) throw AppError.forbidden(NOT_A_MEMBER);
  }

  function storagePath(key) {
    // Anahtar yalnız UUID olabilir; böylece VT'deki değer ne olursa olsun yükleme dizininin dışına çıkılamaz
    if (!UUID.test(key)) throw new Error(`Geçersiz depolama anahtarı: dosya kaydı bozuk (${key})`);
    return path.join(uploadDir, key);
  }

  return {
    assertProjectAccess,

    async list(user, projectId, filters) {
      await assertProjectAccess(user, projectId);
      return files.listByProject(projectId, filters);
    },

    /** file: multer bellek dosyası ({ originalname, buffer, size }). Erişim, yüklemeden önce rotada denetlenir. */
    async upload(user, projectId, file, { taskId } = {}) {
      if (!file) throw invalid('file', 'Yüklenecek dosya (file alanı) zorunludur.');
      const checked = inspectFile(file.originalname, file.buffer);
      if (checked.error) throw invalid('file', checked.error);
      if (taskId) {
        const task = await tasks.findById(taskId);
        if (!task || task.project_id !== projectId) throw invalid('task_id', 'Görev bu projeye ait değil.');
      }

      const storageKey = randomUUID();
      const target = storagePath(storageKey);
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(target, file.buffer, { flag: 'wx', mode: 0o600 });
      try {
        return await files.create({
          projectId,
          taskId,
          uploaderId: user.id,
          name: checked.name,
          type: checked.mime,
          size: file.size,
          storageKey,
        });
      } catch (e) {
        await fs.rm(target, { force: true }); // kayıt yoksa diskte de artık dosya kalmasın
        throw e;
      }
    },

    /** İndirilecek dosyanın meta verisi ve diskteki yolu. */
    async openForDownload(user, fileId) {
      const file = await files.findWithStorage(fileId);
      if (!file) throw AppError.notFound(FILE_NOT_FOUND);
      if (!seesAllProjects(user) && !(await projects.isMember(file.project_id, user.id))) {
        throw AppError.forbidden(NOT_A_MEMBER);
      }
      const filePath = storagePath(file.storage_path);
      try {
        await fs.access(filePath);
      } catch {
        throw AppError.notFound('Dosyanın içeriği sunucuda bulunamadı.');
      }
      const { storage_path: _key, ...meta } = file;
      return { meta, filePath };
    },
  };
}

module.exports = { createFilesService };
