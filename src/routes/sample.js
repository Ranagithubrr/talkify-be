const { Router } = require('express');
const sampleController = require('../controllers/sampleController');

const router = Router();

router.get('/', sampleController.getMessage);
router.get('/db-status', sampleController.getDbStatus);

module.exports = router;
