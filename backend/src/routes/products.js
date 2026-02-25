const express = require('express');
const router = express.Router();
const { body, query: queryValidator } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const productController = require('../controllers/productController');

// GET /api/products — public
router.get('/', optionalAuth, productController.getAll);

// GET /api/products/featured — public
router.get('/featured', productController.getFeatured);

// GET /api/products/search — public
router.get('/search', productController.search);

// GET /api/products/:id — public
router.get('/:id', productController.getById);

// POST /api/products — admin only
router.post('/', authenticate, requireAdmin, upload.array('images', 10), productController.create);

// PUT /api/products/:id — admin only
router.put('/:id', authenticate, requireAdmin, upload.array('images', 10), productController.update);

// DELETE /api/products/:id — admin only
router.delete('/:id', authenticate, requireAdmin, productController.delete);

module.exports = router;
