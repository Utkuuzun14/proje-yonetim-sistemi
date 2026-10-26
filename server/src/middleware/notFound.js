'use strict';
const AppError = require('../utils/AppError');

module.exports = (req, res, next) => next(AppError.notFound(`Uç nokta bulunamadı: ${req.method} ${req.originalUrl}`));
