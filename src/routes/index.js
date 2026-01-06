const { Router } = require('express');
const sampleRoutes = require('./sample');
const authRoutes = require('./auth');

function routes() {
  const router = Router();

  router.use('/sample', sampleRoutes);
  router.use('/auth', authRoutes);

  return router;
}

module.exports = routes;
