const { Router } = require('express');
const sampleRoutes = require('./sample');

function routes() {
  const router = Router();

  router.use('/sample', sampleRoutes);

  return router;
}

module.exports = routes;
