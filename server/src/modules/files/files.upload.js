'use strict';
const multer = require('multer');
const AppError = require('../../utils/AppError');
const { MAX_FILE_SIZE } = require('./files.validation');

/**
 * multipart/form-data ayrıştırıcı: tek dosya (`file` alanı), en fazla 10 MB (FR-13.1).
 * Dosya önce bellekte tutulur; tür ve imza doğrulandıktan sonra diske yazılır. Böylece reddedilen
 * dosya hiçbir zaman diske ulaşmaz.
 */
const parser = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1, fields: 5, parts: 6 },
  defParamCharset: 'utf8', // Türkçe dosya adları (ör. "Gereksinim Belgesi.pdf") bozulmasın
}).single('file');

const MESSAGES = {
  LIMIT_FILE_COUNT: 'Tek seferde yalnız bir dosya yüklenebilir.',
  LIMIT_UNEXPECTED_FILE: 'Dosya "file" alanıyla ve tek dosya olarak gönderilmelidir.',
  LIMIT_PART_COUNT: 'İstekte çok fazla alan var.',
  LIMIT_FIELD_COUNT: 'İstekte çok fazla alan var.',
};

module.exports = (req, res, next) =>
  parser(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError(413, 'PAYLOAD_TOO_LARGE', 'Dosya en fazla 10 MB olabilir.'));
    }
    const message = MESSAGES[err.code] || 'Dosya yükleme isteği okunamadı (multipart/form-data bekleniyor).';
    return next(AppError.badRequest(message, [{ field: 'file', message }]));
  });
