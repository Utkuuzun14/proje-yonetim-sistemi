'use strict';
const { rateLimit } = require('express-rate-limit');
const config = require('../config');

/**
 * SRS 4.2 (5): /api/auth/login için aynı IP'den pencere başına en fazla N başarısız deneme.
 * Başarılı girişler sayılmaz. Aşımda 429 + Retry-After başlığı döner.
 * Her createApp() çağrısı kendi sayaç deposunu oluşturur (testlerde birbirini etkilemez).
 */
function createLoginRateLimit(options = {}) {
  const windowMs = options.windowMs ?? config.loginRateLimit.windowMs;
  return rateLimit({
    windowMs,
    limit: options.maxFailures ?? config.loginRateLimit.maxFailures,
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: `Çok fazla başarısız giriş denemesi. Lütfen ${Math.ceil(windowMs / 60000)} dakika sonra tekrar deneyin.`,
        },
      });
    },
  });
}

module.exports = { createLoginRateLimit };
