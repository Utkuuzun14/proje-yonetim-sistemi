'use strict';
const AppError = require('./AppError');

// PostgreSQL SERIAL/INT üst sınırı; daha büyük değer sorguda 500'e yol açar (#102)
const MAX_INT = 2147483647;

/** URL parametresini pozitif tam sayı kimliğe çevirir; geçersizse 400 fırlatır. */
module.exports = function parseId(value, message = 'Geçersiz kimlik.') {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0 || id > MAX_INT) throw AppError.badRequest(message);
  return id;
};
