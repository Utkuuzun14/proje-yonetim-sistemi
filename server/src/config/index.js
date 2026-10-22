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
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 12, // SRS FR-02: en az 12
  loginRateLimit: {
    // SRS 4.2/5: aynı IP'den 15 dakikada en fazla 5 başarısız giriş denemesi
    windowMs: Number(process.env.LOGIN_RATE_WINDOW_MS) || 15 * 60 * 1000,
    maxFailures: Number(process.env.LOGIN_RATE_MAX_FAILURES) || 5,
  },
  corsOrigin: process.env.CORS_ORIGIN || '*',
  trustProxy: process.env.TRUST_PROXY === 'true',
};

if (!config.jwt.secret) {
  throw new Error('JWT_SECRET ortam değişkeni production ortamında zorunludur.');
}

module.exports = config;
