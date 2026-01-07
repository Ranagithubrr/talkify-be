const { Router } = require('express');
const {
  listConversations,
  createConversation,
} = require('../controllers/conversationController');

const router = Router();

router.get('/', listConversations);
router.post('/', createConversation);

module.exports = router;
