const express = require('express');
const cors = require('cors');

const config = require('../config');
const routes = require('../routes');

function createApp() {
  const app = express();

  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use('/api', routes());

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use((req, res) => {
    res.status(404).json({ message: 'Not Found' });
  });

  app.use((err, req, res, next) => {
    console.error(err); // basic logging
    res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
  });

  return app;
}

module.exports = createApp;
