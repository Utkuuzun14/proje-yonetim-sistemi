'use strict';
const { z } = require('zod');

// Boş metin "değer yok" sayılır (ön yüz formu boş alanları '' gönderir)
const emptyToNull = (v) => (v === '' ? null : v);

const date = z.preprocess(
  emptyToNull,
  z.iso.date({ error: 'Tarih YYYY-AA-GG biçiminde olmalıdır.' }).nullable(),
);

const fields = {
  name: z
    .string({ error: 'Proje adı zorunludur.' })
    .trim()
    .min(1, 'Proje adı zorunludur.')
    .max(150, 'Proje adı en fazla 150 karakter olabilir.'),
  description: z.preprocess(
    (v) => (typeof v === 'string' ? emptyToNull(v.trim()) : v),
    z.string({ error: 'Açıklama metin olmalıdır.' }).max(5000, 'Açıklama en fazla 5000 karakter olabilir.').nullable(),
  ),
  start_date: date,
  end_date: date,
};

/** Bitiş başlangıçtan önce olamaz (SRS FR-04, TS-PRJ-02). Güncellemede mevcut değerlerle birlikte de kontrol edilir. */
function datesInOrder(startDate, endDate) {
  return !startDate || !endDate || startDate <= endDate;
}
const DATE_ORDER_MESSAGE = 'Bitiş tarihi başlangıç tarihinden önce olamaz.';

const checkDates = (value, ctx) => {
  if (!datesInOrder(value.start_date, value.end_date)) {
    ctx.addIssue({ code: 'custom', path: ['end_date'], message: DATE_ORDER_MESSAGE });
  }
};

const createProjectSchema = z
  .object({
    name: fields.name,
    description: fields.description.optional(),
    start_date: fields.start_date.optional(),
    end_date: fields.end_date.optional(),
  })
  .superRefine(checkDates);

const updateProjectSchema = z
  .object(fields)
  .partial()
  .superRefine(checkDates)
  .refine((v) => Object.keys(v).length > 0, { message: 'Güncellenecek en az bir alan gönderin.' });

const addMemberSchema = z.object({
  userId: z
    .number({ error: 'Kullanıcı kimliği (userId) zorunludur ve sayı olmalıdır.' })
    .int('Geçersiz kullanıcı kimliği.')
    .positive('Geçersiz kullanıcı kimliği.')
    .max(2147483647, 'Geçersiz kullanıcı kimliği.'),
});

module.exports = { createProjectSchema, updateProjectSchema, addMemberSchema, datesInOrder, DATE_ORDER_MESSAGE };
