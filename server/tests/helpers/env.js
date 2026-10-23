'use strict';
const { TEST_DATABASE_URL } = require('./testDb');

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = TEST_DATABASE_URL;
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.BCRYPT_ROUNDS = '4'; // testleri hızlandırır; üretimde 10
