'use strict';
const { inspectFile, sanitizeName } = require('../../src/modules/files/files.validation');

const ZIP_HEAD = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
const zipWith = (entry) => Buffer.concat([ZIP_HEAD, Buffer.alloc(26), Buffer.from(entry), Buffer.alloc(32)]);
const JPG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(32)]);

describe('files.validation (birim)', () => {
  test.each([
    ['foto.JPG', JPG, 'image/jpeg'],
    ['foto.jpeg', JPG, 'image/jpeg'],
    ['arsiv.zip', zipWith('a.txt'), 'application/zip'],
    ['belge.docx', zipWith('word/document.xml'), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ['tablo.xlsx', zipWith('xl/workbook.xml'), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  ])('%s kabul edilir; MIME içerikten belirlenir', (name, buffer, mime) => {
    expect(inspectFile(name, buffer)).toEqual({ name, mime });
  });

  test.each([
    ['Office klasörü olmayan .docx (yeniden adlandırılmış zip)', 'belge.docx', zipWith('a.txt')],
    ['Word içeriği .xlsx adıyla', 'tablo.xlsx', zipWith('word/document.xml')],
    ['uzantısız ad', 'README', JPG],
    ['yalnız uzantı', '.pdf', Buffer.from('%PDF-1.4')],
    ['boş ad', '', Buffer.from('%PDF-1.4')],
  ])('%s → reddedilir', (_ad, name, buffer) => {
    expect(inspectFile(name, buffer)).toHaveProperty('error');
  });

  test('yol parçaları, denetim karakterleri ve baştaki noktalar atılır; Türkçe ad korunur', () => {
    expect(sanitizeName('..\\..\\Windows\\gizli.pdf')).toBe('gizli.pdf');
    expect(sanitizeName('../../etc/passwd.pdf')).toBe('passwd.pdf');
    expect(sanitizeName('Gereksinim\u0000 Belgesi<1>.pdf')).toBe('Gereksinim Belgesi1.pdf');
    expect(sanitizeName('...gizli.pdf')).toBe('gizli.pdf');
    expect(sanitizeName('Şartname — Öğrenci Çıktısı.pdf')).toBe('Şartname — Öğrenci Çıktısı.pdf');
  });

  test('255 karakteri aşan ad uzantısı korunarak kısaltılır', () => {
    const name = sanitizeName(`${'a'.repeat(300)}.pdf`);
    expect(name).toHaveLength(255);
    expect(name.endsWith('.pdf')).toBe(true);
  });
});
