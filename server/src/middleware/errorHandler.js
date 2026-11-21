'use strict';
const AppError = require('../utils/AppError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    const body = { code: err.code, message: err.message };
    if (err.details) body.details = err.details;
    return res.status(err.status).json({ error: body });
  }

  // Bozuk JSON gövdesi
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { code: 'INVALID_JSON', message: 'İstek gövdesi geçerli bir JSON değil.' } });
  }

  // Gövde boyut sınırı (express.json limit: 1mb) aşıldı (#103)
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'İstek gövdesi çok büyük (en fazla 1 MB).' } });
  }

  // Beklenmeyen hata: ayrıntı istemciye sızdırılmaz
  if (process.env.NODE_ENV !== 'test') console.error(err);
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Beklenmeyen bir sunucu hatası oluştu.' } });
}

module.exports = errorHandler;
