'use strict';
const AppError = require('../utils/AppError');

/**
 * Zod şemasıyla istek gövdesini doğrular; geçerliyse req.body'yi temizlenmiş veriyle değiştirir.
 * Hata ayrıntısı: [{ field, message }]
 */
module.exports = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    // Kök seviye hata (ör. gövde dizi veya metin): zod'un İngilizce varsayılan mesajı yerine Türkçe (#105)
    const details = result.error.issues.map((i) =>
      !i.path.length && i.code === 'invalid_type'
        ? { field: null, message: 'İstek gövdesi bir JSON nesnesi olmalıdır.' }
        : { field: i.path.join('.') || null, message: i.message },
    );
    return next(AppError.badRequest('Gönderilen veriler geçersiz.', details));
  }
  req.body = result.data;
  return next();
};
