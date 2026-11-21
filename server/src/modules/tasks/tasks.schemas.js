'use strict';
const { z } = require('zod');
const { datesInOrder, DATE_ORDER_MESSAGE } = require('../projects/projects.schemas');

const TASK_STATUSES = ['To Do', 'In Progress', 'Done'];
const TASK_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const TASK_TYPES = ['Task', 'Bug', 'Feature']; // Karar 11
const TITLE_MAX = 150; // Karar 13, SRS FR-06 (VT 200'de kalır, API 150'yi denetler)
const MAX_INT = 2147483647;

const emptyToNull = (v) => (v === '' ? null : v);
const oneOf = (values, label) => z.enum(values, { error: `${label} şunlardan biri olmalıdır: ${values.join(', ')}.` });

const date = z.preprocess(emptyToNull, z.iso.date({ error: 'Tarih YYYY-AA-GG biçiminde olmalıdır.' }).nullable());
const id = (message) => z.number({ error: message }).int(message).positive(message).max(MAX_INT, message);

const fields = {
  title: z
    .string({ error: 'Görev başlığı zorunludur.' })
    .trim()
    .min(1, 'Görev başlığı zorunludur.')
    .max(TITLE_MAX, `Görev başlığı en fazla ${TITLE_MAX} karakter olabilir.`),
  description: z.preprocess(
    (v) => (typeof v === 'string' ? emptyToNull(v.trim()) : v),
    z.string({ error: 'Açıklama metin olmalıdır.' }).max(5000, 'Açıklama en fazla 5000 karakter olabilir.').nullable(),
  ),
  status: oneOf(TASK_STATUSES, 'Durum'),
  priority: oneOf(TASK_PRIORITIES, 'Öncelik'),
  type: oneOf(TASK_TYPES, 'Görev türü'),
  assignee_id: z.preprocess(emptyToNull, id('Geçersiz kullanıcı kimliği (assignee_id).').nullable()),
  start_date: date,
  end_date: date,
};

const checkDates = (value, ctx) => {
  if (!datesInOrder(value.start_date, value.end_date)) {
    ctx.addIssue({ code: 'custom', path: ['end_date'], message: DATE_ORDER_MESSAGE });
  }
};

const createTaskSchema = z
  .object({
    title: fields.title,
    description: fields.description.optional(),
    status: fields.status.default('To Do'),
    priority: fields.priority.default('Medium'),
    type: fields.type.default('Task'),
    assignee_id: fields.assignee_id.optional(),
    start_date: fields.start_date.optional(),
    end_date: fields.end_date.optional(),
  })
  .superRefine(checkDates);

const updateTaskSchema = z
  .object(fields)
  .partial()
  .superRefine(checkDates)
  .refine((v) => Object.keys(v).length > 0, { message: 'Güncellenecek en az bir alan gönderin.' });

/** GET /api/projects/:id/tasks filtreleri (FR-09; from/to takvim ve Gantt için, #58). */
const listTasksQuery = z
  .object({
    status: fields.status.optional(),
    priority: fields.priority.optional(),
    type: fields.type.optional(),
    assigneeId: z.coerce.number({ error: 'assigneeId sayı olmalıdır.' }).pipe(id('Geçersiz kullanıcı kimliği (assigneeId).')).optional(),
    from: z.iso.date({ error: 'from YYYY-AA-GG biçiminde olmalıdır.' }).optional(),
    to: z.iso.date({ error: 'to YYYY-AA-GG biçiminde olmalıdır.' }).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.from && v.to && v.from > v.to) {
      ctx.addIssue({ code: 'custom', path: ['to'], message: 'to, from tarihinden önce olamaz.' });
    }
  });

const createCommentSchema = z.object({
  content: z
    .string({ error: 'Yorum metni zorunludur.' })
    .trim()
    .min(1, 'Yorum boş olamaz.')
    .max(5000, 'Yorum en fazla 5000 karakter olabilir.'),
});

module.exports = {
  TASK_STATUSES,
  TASK_PRIORITIES,
  TASK_TYPES,
  TITLE_MAX,
  createTaskSchema,
  updateTaskSchema,
  listTasksQuery,
  createCommentSchema,
};
