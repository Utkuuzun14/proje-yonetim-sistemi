'use strict';
const path = require('path');

const MAX_FILE_SIZE = 10 * 1024 * 1024; // FR-13.1: 10 MB
const MAX_NAME_LENGTH = 255; // files.name VARCHAR(255)

const ZIP = [
  [0x50, 0x4b, 0x03, 0x04], // yerel dosya başlığı
  [0x50, 0x4b, 0x05, 0x06], // boş arşiv
];

/**
 * FR-13.2 izin listesi ve FR-13.3 bayt imzaları (magic bytes). MIME türü istemcinin beyanından değil,
 * uzantı + içerik doğrulamasından gelir. docx/xlsx birer ZIP arşividir; içlerinde Office klasörü aranır.
 */
const ALLOWED = {
  '.pdf': { mime: 'application/pdf', signatures: [[0x25, 0x50, 0x44, 0x46, 0x2d]] }, // %PDF-
  '.png': { mime: 'image/png', signatures: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]] },
  '.jpg': { mime: 'image/jpeg', signatures: [[0xff, 0xd8, 0xff]] },
  '.jpeg': { mime: 'image/jpeg', signatures: [[0xff, 0xd8, 0xff]] },
  '.docx': {
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    signatures: ZIP,
    contains: 'word/',
  },
  '.xlsx': {
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    signatures: ZIP,
    contains: 'xl/',
  },
  '.zip': { mime: 'application/zip', signatures: ZIP },
};
const ALLOWED_EXTENSIONS = Object.keys(ALLOWED);

const startsWith = (buffer, signature) =>
  buffer.length >= signature.length && signature.every((byte, i) => buffer[i] === byte);

/**
 * İstemcinin gönderdiği adı güvenli bir görünen ada çevirir: yol parçaları (../, C:\), denetim ve
 * dosya sisteminde sorun çıkaran karakterler atılır. Ad yalnız gösterim içindir; diskte UUID kullanılır (FR-13.4).
 */
function sanitizeName(original) {
  const base = String(original || '')
    .normalize('NFC')
    .split(/[\\/]/)
    .pop()
    .replace(/[\u0000-\u001f\u007f<>:"|?*]/g, '') // eslint-disable-line no-control-regex
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\.+/, '');
  if (base.length <= MAX_NAME_LENGTH) return base;
  const ext = path.extname(base);
  return base.slice(0, MAX_NAME_LENGTH - ext.length) + ext;
}

/**
 * Dosyayı doğrular. Geçersizse { error } döner; geçerliyse { name, mime }.
 * Uzantı yalnız son noktadan sonrasıdır: "rapor.pdf.exe" → .exe → reddedilir.
 */
function inspectFile(originalName, buffer) {
  const name = sanitizeName(originalName);
  const ext = path.extname(name).toLowerCase();
  if (!name || name === ext) return { error: 'Geçerli bir dosya adı gerekli.' };
  const rule = ALLOWED[ext];
  if (!rule) {
    return { error: `Bu dosya türüne izin verilmiyor. İzin verilenler: ${ALLOWED_EXTENSIONS.join(', ')}.` };
  }
  const signatureOk = rule.signatures.some((s) => startsWith(buffer, s));
  if (!signatureOk || (rule.contains && !buffer.includes(rule.contains))) {
    return { error: `Dosyanın içeriği ${ext} uzantısıyla uyuşmuyor.` };
  }
  return { name, mime: rule.mime };
}

module.exports = { MAX_FILE_SIZE, ALLOWED_EXTENSIONS, sanitizeName, inspectFile };
