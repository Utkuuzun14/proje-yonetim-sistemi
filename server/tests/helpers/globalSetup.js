'use strict';
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { TEST_DATABASE_URL } = require('./testDb');

const DB_DIR = path.join(__dirname, '..', '..', '..', 'database');

/**
 * Test VT'sini oluşturur (yoksa) ve Buğra'nın database/init.sql + seed.sql dosyalarını yükler.
 * Böylece testler her koşuda aynı, bilinen veriyle başlar.
 */
module.exports = async () => {
  const url = new URL(TEST_DATABASE_URL);
  const dbName = url.pathname.slice(1);
  if (!/^[a-z0-9_]+$/i.test(dbName)) throw new Error(`Geçersiz test VT adı: ${dbName}`);

  const adminUrl = new URL(TEST_DATABASE_URL);
  adminUrl.pathname = '/postgres';
  const admin = new Client({ connectionString: adminUrl.toString() });
  try {
    await admin.connect();
  } catch (e) {
    throw new Error(
      `Test veri tabanına bağlanılamadı (${url.host}). Önce "docker compose up -d" ile VT'yi başlatın ` +
        `veya TEST_DATABASE_URL tanımlayın.\n${e.message}`,
    );
  }
  const { rowCount } = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
  if (!rowCount) await admin.query(`CREATE DATABASE ${dbName}`);
  await admin.end();

  const client = new Client({ connectionString: TEST_DATABASE_URL });
  await client.connect();
  await client.query('SET client_min_messages TO WARNING');
  for (const file of ['init.sql', 'seed.sql']) {
    await client.query(fs.readFileSync(path.join(DB_DIR, file), 'utf8'));
  }
  await client.end();
};
