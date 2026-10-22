'use strict';
const { z } = require('zod');

const email = z
  .string({ error: 'E-posta zorunludur.' })
  .trim()
  .toLowerCase()
  .max(100, 'E-posta en fazla 100 karakter olabilir.')
  .pipe(z.email({ error: 'Geçerli bir e-posta adresi girin.' }));

const registerSchema = z.object({
  name: z
    .string({ error: 'Ad soyad zorunludur.' })
    .trim()
    .min(2, 'Ad soyad en az 2 karakter olmalıdır.')
    .max(100, 'Ad soyad en fazla 100 karakter olabilir.'),
  email,
  password: z
    .string({ error: 'Şifre zorunludur.' })
    .min(8, 'Şifre en az 8 karakter olmalıdır.')
    .max(72, 'Şifre en fazla 72 karakter olabilir.')
    .regex(/[A-Za-zÇĞİÖŞÜçğıöşü]/, 'Şifre en az bir harf içermelidir.')
    .regex(/[0-9]/, 'Şifre en az bir rakam içermelidir.'),
});

const loginSchema = z.object({
  email,
  password: z.string({ error: 'Şifre zorunludur.' }).min(1, 'Şifre zorunludur.'),
});

module.exports = { registerSchema, loginSchema };
