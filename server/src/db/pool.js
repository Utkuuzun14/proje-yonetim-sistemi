'use strict';
const { Pool, types } = require('pg');
const config = require('../config');

// DATE (oid 1082) sütunları JS Date'e çevrilmesin: saat dilimi kayması olmadan 'YYYY-AA-GG' metni olarak dönsün
types.setTypeParser(1082, (value) => value);

const pool = new Pool({ connectionString: config.databaseUrl });

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
};
