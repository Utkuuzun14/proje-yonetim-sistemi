'use strict';
const jwt = require('jsonwebtoken');
const config = require('../config');
const AppError = require('../utils/AppError');

/** Authorization: Bearer <token> başlığını doğrular, req.user = { id, role } ekler. */
module.exports = (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return next(AppError.unauthorized());

  try {
    const payload = jwt.verify(token, config.jwt.secret);
    req.user = { id: Number(payload.sub), role: payload.role };
    return next();
  } catch (e) {
    return next(AppError.unauthorized('Oturum geçersiz veya süresi dolmuş. Lütfen tekrar giriş yapın.'));
  }
};
