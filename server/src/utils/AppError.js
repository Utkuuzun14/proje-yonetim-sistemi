'use strict';

/**
 * Uygulama genelinde kullanılan, istemciye güvenle gösterilebilecek hata.
 * Yanıt biçimi: { error: { code, message, details? } }
 */
class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    if (details !== undefined) this.details = details;
  }

  static badRequest(message, details) { return new AppError(400, 'VALIDATION_ERROR', message, details); }
  static unauthorized(message = 'Kimlik doğrulaması gerekli.') { return new AppError(401, 'UNAUTHORIZED', message); }
  static forbidden(message = 'Bu işlem için yetkiniz yok.') { return new AppError(403, 'FORBIDDEN', message); }
  static notFound(message = 'Kayıt bulunamadı.') { return new AppError(404, 'NOT_FOUND', message); }
  static conflict(message) { return new AppError(409, 'CONFLICT', message); }
}

module.exports = AppError;
