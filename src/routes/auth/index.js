const { Router } = require('express');
const register = require('../../controllers/auth/registerController');

const router = Router();

router.post('/register', register);

module.exports = router;
