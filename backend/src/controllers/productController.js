const { query } = require('../config/database');

// ─── Helper: Build product object ────────────────────────────────────────────
function buildProduct(row, images = [], specs = []) {
  return {
    ...row,
    price:       parseFloat(row.price),
    sale_price:  row.sale_price ? parseFloat(row.sale_price) : null,
    rating:      parseFloat(row.rating || 0),
    is_featured: Boolean(row.is_featured),
    is_active:   Boolean(row.is_active),
    images,
    specifications: specs,
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags || '[]') : (row.tags || []),
  };
}

async function getAll(req, res) {
  try {
    const {
      category, brand, search, sort = 'newest',
      minPrice, maxPrice, page = 1, limit = 12,
      featured, sale,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = ['p.is_active = 1'];
    const params = [];
    let idx = 1;

    if (category) {
      conditions.push(`c.slug = $${idx++}`);
      params.push(category);
    }
    if (brand) {
      conditions.push(`p.brand LIKE $${idx++}`);
      params.push(brand);
    }
    if (search) {
      conditions.push(`(p.name LIKE $${idx} OR p.name_ar LIKE $${idx} OR p.description_ar LIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (minPrice) {
      conditions.push(`COALESCE(p.sale_price, p.price) >= $${idx++}`);
      params.push(parseFloat(minPrice));
    }
    if (maxPrice) {
      conditions.push(`COALESCE(p.sale_price, p.price) <= $${idx++}`);
      params.push(parseFloat(maxPrice));
    }
    if (featured === 'true') {
      conditions.push('p.is_featured = 1');
    }
    if (sale === 'true') {
      conditions.push('p.sale_price IS NOT NULL AND p.sale_price < p.price');
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const sortMap = {
      newest:     'p.created_at DESC',
      popular:    'p.review_count DESC',
      price_asc:  'COALESCE(p.sale_price, p.price) ASC',
      price_desc: 'COALESCE(p.sale_price, p.price) DESC',
    };
    const orderBy = sortMap[sort] || 'p.created_at DESC';

    const countResult = await query(
      `SELECT COUNT(*) AS count FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereClause}`,
      params
    );

    const productsResult = await query(
      `SELECT p.*, c.name AS category_name, c.name_ar AS category_name_ar, c.slug AS category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereClause}
       ORDER BY ${orderBy}
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, parseInt(limit), offset]
    );

    const products = await Promise.all(
      productsResult.rows.map(async (row) => {
        const [imagesRes, specsRes] = await Promise.all([
          query('SELECT * FROM product_images WHERE product_id = $1 ORDER BY is_primary DESC', [row.id]),
          query('SELECT * FROM product_specifications WHERE product_id = $1 ORDER BY sort_order', [row.id]),
        ]);
        return buildProduct(
          {
            ...row,
            category: row.category_name ? {
              id: row.category_id, name: row.category_name, name_ar: row.category_name_ar, slug: row.category_slug,
            } : null,
          },
          imagesRes.rows,
          specsRes.rows
        );
      })
    );

    const total = parseInt(countResult.rows[0]?.count || 0);
    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('getAll products error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function getById(req, res) {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT p.*, c.name AS category_name, c.name_ar AS category_name_ar, c.slug AS category_slug, c.id AS cat_id
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1 AND p.is_active = 1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const row = result.rows[0];
    const [imagesRes, specsRes] = await Promise.all([
      query('SELECT * FROM product_images WHERE product_id = $1 ORDER BY is_primary DESC', [id]),
      query('SELECT * FROM product_specifications WHERE product_id = $1 ORDER BY sort_order', [id]),
    ]);

    const product = buildProduct(
      {
        ...row,
        category: row.category_name ? {
          id: row.cat_id, name: row.category_name, name_ar: row.category_name_ar, slug: row.category_slug,
        } : null,
      },
      imagesRes.rows,
      specsRes.rows
    );

    res.json({ success: true, data: product });
  } catch (err) {
    console.error('getById error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function getFeatured(req, res) {
  try {
    const result = await query(
      `SELECT p.*, c.name AS category_name, c.name_ar AS category_name_ar, c.slug AS category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.is_active = 1 AND p.is_featured = 1
       ORDER BY p.created_at DESC
       LIMIT 8`
    );

    const products = await Promise.all(
      result.rows.map(async (row) => {
        const imagesRes = await query(
          'SELECT * FROM product_images WHERE product_id = $1 ORDER BY is_primary DESC LIMIT 1', [row.id]
        );
        return buildProduct(
          {
            ...row,
            category: {
              id: row.category_id, name: row.category_name, name_ar: row.category_name_ar, slug: row.category_slug,
            },
          },
          imagesRes.rows,
          []
        );
      })
    );

    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function search(req, res) {
  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    return res.json({ success: true, data: [] });
  }
  try {
    const result = await query(
      `SELECT p.id, p.name, p.name_ar, p.price, p.sale_price, p.category_id,
              c.name_ar AS category_name_ar
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.is_active = 1
         AND (p.name LIKE $1 OR p.name_ar LIKE $1 OR p.brand LIKE $1)
       ORDER BY p.review_count DESC
       LIMIT 10`,
      [`%${q}%`]
    );

    const products = await Promise.all(
      result.rows.map(async (row) => {
        const img = await query(
          'SELECT url FROM product_images WHERE product_id = $1 AND is_primary = 1 LIMIT 1', [row.id]
        );
        return {
          ...row,
          price:      parseFloat(row.price),
          sale_price: row.sale_price ? parseFloat(row.sale_price) : null,
          category:   { name_ar: row.category_name_ar },
          images: img.rows.map((r) => ({ url: r.url, is_primary: true })),
        };
      })
    );

    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function create(req, res) {
  const client = await require('../config/database').getClient();
  try {
    await client.query('BEGIN');

    const {
      name, name_ar, description, description_ar,
      price, sale_price, sku, stock, category_id,
      brand, is_featured, is_active, tags, specifications,
    } = req.body;

    const skuCheck = await client.query('SELECT id FROM products WHERE sku = $1', [sku]);
    if (skuCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, message: 'SKU already exists' });
    }

    const parsedTags  = typeof tags === 'string' ? JSON.parse(tags) : (tags || []);
    const parsedSpecs = typeof specifications === 'string' ? JSON.parse(specifications) : (specifications || []);
    const featuredVal = (is_featured === 'true' || is_featured === true) ? 1 : 0;
    const activeVal   = (is_active !== 'false' && is_active !== false) ? 1 : 0;

    const productResult = await client.query(
      `INSERT INTO products
        (name, name_ar, description, description_ar, price, sale_price,
         sku, stock, category_id, brand, is_featured, is_active, tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        name, name_ar, description, description_ar,
        parseFloat(price), sale_price ? parseFloat(sale_price) : null,
        sku, parseInt(stock), parseInt(category_id),
        brand, featuredVal, activeVal,
        JSON.stringify(parsedTags),
      ]
    );

    const productId = productResult.rows[0].id;

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        await client.query(
          'INSERT INTO product_images (product_id, url, alt, is_primary) VALUES ($1,$2,$3,$4)',
          [productId, `/uploads/${file.filename}`, name_ar, i === 0 ? 1 : 0]
        );
      }
    }

    for (let i = 0; i < parsedSpecs.length; i++) {
      const spec = parsedSpecs[i];
      await client.query(
        'INSERT INTO product_specifications (product_id, key, key_ar, value, value_ar, sort_order) VALUES ($1,$2,$3,$4,$5,$6)',
        [productId, spec.key, spec.key_ar, spec.value, spec.value_ar, i]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ success: true, data: { id: productId }, message: 'تم إنشاء المنتج بنجاح' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create product error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    client.release();
  }
}

async function update(req, res) {
  const client = await require('../config/database').getClient();
  try {
    await client.query('BEGIN');
    const { id } = req.params;

    const existing = await client.query('SELECT id FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const {
      name, name_ar, description, description_ar,
      price, sale_price, sku, stock, category_id,
      brand, is_featured, is_active, tags, specifications,
    } = req.body;

    const parsedTags  = typeof tags === 'string' ? JSON.parse(tags) : (tags || []);
    const parsedSpecs = typeof specifications === 'string' ? JSON.parse(specifications) : (specifications || []);
    const featuredVal = (is_featured === 'true' || is_featured === true) ? 1 : 0;
    const activeVal   = (is_active !== 'false' && is_active !== false) ? 1 : 0;

    await client.query(
      `UPDATE products SET
        name=$1, name_ar=$2, description=$3, description_ar=$4,
        price=$5, sale_price=$6, sku=$7, stock=$8, category_id=$9,
        brand=$10, is_featured=$11, is_active=$12, tags=$13,
        updated_at=CURRENT_TIMESTAMP
       WHERE id=$14`,
      [
        name, name_ar, description, description_ar,
        parseFloat(price), sale_price ? parseFloat(sale_price) : null,
        sku, parseInt(stock), parseInt(category_id),
        brand, featuredVal, activeVal,
        JSON.stringify(parsedTags), id,
      ]
    );

    if (req.files && req.files.length > 0) {
      const existingImages = await client.query('SELECT id FROM product_images WHERE product_id = $1', [id]);
      for (const file of req.files) {
        await client.query(
          'INSERT INTO product_images (product_id, url, alt, is_primary) VALUES ($1,$2,$3,$4)',
          [id, `/uploads/${file.filename}`, name_ar, existingImages.rows.length === 0 ? 1 : 0]
        );
      }
    }

    await client.query('DELETE FROM product_specifications WHERE product_id = $1', [id]);
    for (let i = 0; i < parsedSpecs.length; i++) {
      const spec = parsedSpecs[i];
      await client.query(
        'INSERT INTO product_specifications (product_id, key, key_ar, value, value_ar, sort_order) VALUES ($1,$2,$3,$4,$5,$6)',
        [id, spec.key, spec.key_ar, spec.value, spec.value_ar, i]
      );
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'تم تحديث المنتج بنجاح' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Update product error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    client.release();
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const result = await query(
      'UPDATE products SET is_active = 0 WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'تم حذف المنتج' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { getAll, getById, getFeatured, search, create, update, delete: deleteProduct };
