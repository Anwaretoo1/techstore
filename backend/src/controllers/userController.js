const { query } = require('../config/database');

async function getAll(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const countResult = await query("SELECT COUNT(*) AS count FROM users WHERE role = 'customer'");
    const result = await query(
      `SELECT id, email, first_name, last_name, phone, role, is_active, created_at
       FROM users WHERE role = 'customer'
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page), limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function getById(req, res) {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT id, email, first_name, last_name, phone, role, is_active, created_at FROM users WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    const { first_name, last_name, phone, is_active } = req.body;
    const result = await query(
      `UPDATE users SET first_name=$1, last_name=$2, phone=$3, is_active=$4
       WHERE id=$5 RETURNING id, email, first_name, last_name, phone, role, is_active`,
      [first_name, last_name, phone, (is_active !== false && is_active !== 0) ? 1 : 0, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { getAll, getById, update };
