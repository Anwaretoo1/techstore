const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate, requireAdmin } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

// Customer routes
router.post('/',      authenticate, orderController.create);
router.get('/my',     authenticate, orderController.getMyOrders);
router.get('/:id',    authenticate, orderController.getById);

// Admin routes
router.get('/',               authenticate, requireAdmin, orderController.getAll);
router.patch('/:id/status',   authenticate, requireAdmin, [
  body('status').isIn(['pending','processing','shipped','delivered','cancelled']),
  validate,
], orderController.updateStatus);

module.exports = router;
