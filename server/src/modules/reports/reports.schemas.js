'use strict';
const { z } = require('zod');

const FORMAT = 'Tarih YYYY-AA-GG biçiminde olmalıdır.';

/** 'YYYY-AA-GG' takvimde gerçekten var mı (2026-02-30 → hayır)? */
const isRealDate = (s) => {
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};

const day = (field) =>
  z
    .string({ error: `${field} tarihi zorunludur (YYYY-AA-GG).` })
    .regex(/^\d{4}-\d{2}-\d{2}$/, FORMAT)
    .refine(isRealDate, 'Geçersiz tarih: takvimde böyle bir gün yok.');

/** GET /api/projects/:id/reports/range — iki uç dahil, gün bazında. */
const rangeQuery = z
  .object({ from: day('Başlangıç (from)'), to: day('Bitiş (to)') })
  .refine((v) => v.from <= v.to, { path: ['to'], message: 'Bitiş tarihi (to) başlangıçtan (from) önce olamaz.' });

module.exports = { rangeQuery, isRealDate };
