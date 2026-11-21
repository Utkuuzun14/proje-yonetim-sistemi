'use strict';
const { Router } = require('express');
const db = require('../../db/pool');

const router = Router();

router.get('/', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ data: { status: 'ok', database: 'up' } });
  } catch (e) {
    res.status(503).json({ error: { code: 'SERVICE_UNAVAILABLE', message: 'Veri tabanına ulaşılamıyor.' } });
  }
});

module.exports = router;
