const { Router } = require('express');
const register = require('../../controllers/auth/registerController');
const login = require('../../controllers/auth/loginController');
const refresh = require('../../controllers/auth/refreshController');

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);

module.exports = router;
