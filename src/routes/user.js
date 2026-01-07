const { Router } = require('express');
const { listUsers } = require('../controllers/userController');

const router = Router();

router.get('/', listUsers);

module.exports = router;
