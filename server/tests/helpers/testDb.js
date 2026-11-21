'use strict';
// Test veri tabanı adresi. Geliştirme VT'sini (sektech) asla kullanmaz; init.sql tabloları silip yeniden kurar.
const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || 'postgresql://admin:password@localhost:5433/sektech_test';

module.exports = { TEST_DATABASE_URL };
