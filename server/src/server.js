'use strict';
const config = require('./config');
const { createApp } = require('./app');

const app = createApp();

app.listen(config.port, () => {
  console.log(`SEK TECH API http://localhost:${config.port} adresinde çalışıyor (${config.env})`);
  console.log(`API dokümanı: http://localhost:${config.port}/api/docs`);
});
