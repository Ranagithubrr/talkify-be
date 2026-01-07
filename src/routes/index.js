const { Router } = require('express');
const authRoutes = require('./auth');
const messageRoutes = require('./message');
const conversationRoutes = require('./conversation');
const userRoutes = require('./user');

function routes() {
  const router = Router();

  router.use('/auth', authRoutes);
  router.use('/messages', messageRoutes);
  router.use('/conversations', conversationRoutes);
  router.use('/users', userRoutes);

  return router;
}

module.exports = routes;
