const { Router } = require('express');
const { sendMessage, getConversation } = require('../controllers/messageController');

const router = Router();

router.post('/', sendMessage);
router.get('/', getConversation);

module.exports = router;
