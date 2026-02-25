const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const userController = require('../controllers/userController');

router.get('/',     authenticate, requireAdmin, userController.getAll);
router.get('/:id',  authenticate, requireAdmin, userController.getById);
router.put('/:id',  authenticate, requireAdmin, userController.update);

module.exports = router;
