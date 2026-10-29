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

function createApp(options = {}) {
  const app = express();
  if (config.trustProxy) app.set('trust proxy', 1); // ters vekil arkasında gerçek istemci IP'si

  app.use(helmet({ contentSecurityPolicy: false })); // Swagger UI satır içi betik kullanır
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/openapi.json', (req, res) => res.json(openapi));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi, { customSiteTitle: 'SEK TECH API' }));

  app.use('/api/health', require('./modules/health/health.routes'));
  app.use('/api/auth', require('./modules/auth/auth.routes').createAuthRouter(options));
  app.use('/api/users', require('./modules/users/users.routes'));
  app.use('/api/projects', require('./modules/projects/projects.routes'));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
