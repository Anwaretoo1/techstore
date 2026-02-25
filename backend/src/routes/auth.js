const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const authController = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', [
  body('email').isEmail().withMessage('بريد إلكتروني غير صالح').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  body('first_name').trim().notEmpty().withMessage('الاسم الأول مطلوب'),
  body('last_name').trim().notEmpty().withMessage('الاسم الأخير مطلوب'),
  body('phone').optional().isMobilePhone().withMessage('رقم هاتف غير صالح'),
  validate,
], authController.register);

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().withMessage('بريد إلكتروني غير صالح').normalizeEmail(),
  body('password').notEmpty().withMessage('كلمة المرور مطلوبة'),
  validate,
], authController.login);

// GET /api/auth/me
router.get('/me', authenticate, authController.me);

module.exports = router;
