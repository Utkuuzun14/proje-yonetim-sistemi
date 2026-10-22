'use strict';
require('dotenv').config({ quiet: true });

const env = process.env.NODE_ENV || 'development';

const config = {
  env,
  port: Number(process.env.PORT) || 5000,
  databaseUrl: process.env.DATABASE_URL || 'postgresql://admin:password@localhost:5433/sektech',
  jwt: {
    secret: process.env.JWT_SECRET || (env === 'production' ? undefined : 'dev-jwt-secret-key-sektech-2026'),
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 10,
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

if (!config.jwt.secret) {
  throw new Error('JWT_SECRET ortam değişkeni production ortamında zorunludur.');
}

module.exports = config;
