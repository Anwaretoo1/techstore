const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

router.post('/validate', authenticate, async (req, res) => {
  const { code } = req.body;
  const { query } = require('../config/database');

  try {
    const result = await query(
      `SELECT * FROM coupons
       WHERE code = $1
         AND is_active = 1
         AND (expires_at IS NULL OR expires_at > datetime('now'))
         AND (usage_limit IS NULL OR used_count < usage_limit)`,
      [code?.toUpperCase()]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'كود الخصم غير صالح أو منتهي الصلاحية' });
    }

    const coupon = result.rows[0];
    const discount_amount = coupon.discount_type === 'percentage'
      ? null // Will be calculated on client based on cart total
      : coupon.discount_value;

    res.json({
      success: true,
      data: {
        code: coupon.code,
        discount_type:  coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: coupon.discount_value, // simplified
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
