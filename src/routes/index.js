const { Router } = require('express');
const authRoutes = require('./auth');
const messageRoutes = require('./message');

function routes() {
  const router = Router();

  router.use('/auth', authRoutes);
  router.use('/messages', messageRoutes);

  return router;
}

module.exports = routes;
