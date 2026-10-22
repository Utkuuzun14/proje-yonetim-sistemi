'use strict';
const fs = require('fs');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const openapi = YAML.parse(fs.readFileSync(path.join(__dirname, 'docs', 'openapi.yaml'), 'utf8'));

function createApp() {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false })); // Swagger UI satır içi betik kullanır
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/openapi.json', (req, res) => res.json(openapi));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi, { customSiteTitle: 'SEK TECH API' }));

  app.use('/api/health', require('./modules/health/health.routes'));
  app.use('/api/auth', require('./modules/auth/auth.routes'));
  app.use('/api/users', require('./modules/users/users.routes'));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
