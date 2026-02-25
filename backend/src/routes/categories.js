const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate, requireAdmin } = require('../middleware/auth');
const categoryController = require('../controllers/categoryController');

router.get('/',     categoryController.getAll);
router.get('/:id',  categoryController.getById);
router.post('/',    authenticate, requireAdmin, [
  body('name').trim().notEmpty().withMessage('اسم الفئة مطلوب'),
  body('name_ar').trim().notEmpty().withMessage('اسم الفئة بالعربي مطلوب'),
  validate,
], categoryController.create);
router.put('/:id',  authenticate, requireAdmin, categoryController.update);
router.delete('/:id', authenticate, requireAdmin, categoryController.delete);

module.exports = router;
