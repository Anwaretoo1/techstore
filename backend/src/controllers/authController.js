const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { generateToken } = require('../config/auth');

async function register(req, res) {
  const { email, password, first_name, last_name, phone } = req.body;
  try {
    // Check existing email
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'البريد الإلكتروني مستخدم بالفعل' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
       VALUES ($1, $2, $3, $4, $5, 'customer')
       RETURNING id, email, first_name, last_name, phone, role`,
      [email, password_hash, first_name, last_name, phone || null]
    );

    const user = result.rows[0];
    const token = generateToken({ id: user.id, role: user.role });

    res.status(201).json({ success: true, data: { user, token } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  try {
    const result = await query(
      'SELECT id, email, first_name, last_name, phone, role, password_hash, is_active FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ success: false, message: 'الحساب موقوف' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });
    }

    const token = generateToken({ id: user.id, role: user.role });
    const { password_hash, ...userWithoutPassword } = user;

    res.json({ success: true, data: { user: userWithoutPassword, token } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function me(req, res) {
  res.json({ success: true, data: req.user });
}

module.exports = { register, login, me };
