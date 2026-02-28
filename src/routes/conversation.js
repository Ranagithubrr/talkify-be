const { Router } = require('express');
const {
  listConversations,
  createConversation,
} = require('../controllers/conversationController');
const authenticate = require('../middlewares/auth');

const router = Router();

router.get('/', authenticate, listConversations);
router.post('/', authenticate, createConversation);

module.exports = router;
