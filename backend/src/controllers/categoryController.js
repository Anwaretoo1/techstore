const { query } = require('../config/database');

async function getAll(req, res) {
  try {
    const result = await query(
      `SELECT c.*,
        COUNT(p.id) AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
       WHERE c.parent_id IS NULL
       GROUP BY c.id
       ORDER BY c.sort_order, c.name_ar`
    );
    res.json({ success: true, data: result.rows.map(r => ({ ...r, product_count: parseInt(r.product_count) })) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function getById(req, res) {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM categories WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function create(req, res) {
  try {
    const { name, name_ar, slug, description, image, parent_id, sort_order } = req.body;
    const generatedSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    const result = await query(
      `INSERT INTO categories (name, name_ar, slug, description, image, parent_id, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, name_ar, generatedSlug, description, image, parent_id || null, sort_order || 0]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ success: false, message: 'Slug already exists' });
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    const { name, name_ar, slug, description, image, sort_order } = req.body;
    const result = await query(
      `UPDATE categories SET name=$1, name_ar=$2, slug=$3, description=$4, image=$5, sort_order=$6
       WHERE id=$7 RETURNING *`,
      [name, name_ar, slug, description, image, sort_order || 0, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    await query('DELETE FROM categories WHERE id = $1', [id]);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { getAll, getById, create, update, delete: deleteCategory };
