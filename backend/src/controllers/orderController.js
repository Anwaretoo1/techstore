const { query, getClient } = require('../config/database');

function generateOrderNumber() {
  const date  = new Date();
  const year  = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const rand  = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${year}${month}-${rand}`;
}

async function create(req, res) {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const {
      items, shipping_address, payment_method,
      subtotal, shipping_cost, discount, total,
      notes, coupon_code,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items provided' });
    }

    // Verify stock
    for (const item of items) {
      const stock = await client.query(
        'SELECT stock FROM products WHERE id = $1 AND is_active = 1', [item.product_id]
      );
      if (stock.rows.length === 0) throw new Error(`Product ${item.product_id} not found`);
      if (stock.rows[0].stock < item.quantity) throw new Error(`Insufficient stock for product ${item.product_id}`);
    }

    const orderNumber = generateOrderNumber();

    const orderResult = await client.query(
      `INSERT INTO orders
        (order_number, user_id, payment_method, status, payment_status,
         subtotal, shipping_cost, discount, total, notes, coupon_code,
         shipping_full_name, shipping_phone, shipping_city, shipping_area,
         shipping_street, shipping_notes)
       VALUES ($1,$2,$3,'pending','pending',$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING *`,
      [
        orderNumber, req.user.id, payment_method,
        parseFloat(subtotal || 0),  parseFloat(shipping_cost || 0),
        parseFloat(discount || 0),  parseFloat(total || 0),
        notes || null, coupon_code || null,
        shipping_address.full_name, shipping_address.phone,
        shipping_address.city, shipping_address.area,
        shipping_address.street, shipping_address.notes || null,
      ]
    );
    const orderId = orderResult.rows[0].id;

    for (const item of items) {
      const product = await client.query('SELECT name, name_ar FROM products WHERE id = $1', [item.product_id]);
      await client.query(
        `INSERT INTO order_items
          (order_id, product_id, product_name, product_name_ar, quantity, unit_price, total_price)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          orderId, item.product_id,
          product.rows[0].name, product.rows[0].name_ar,
          item.quantity,
          parseFloat(item.unit_price),
          parseFloat(item.unit_price) * item.quantity,
        ]
      );
      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [item.quantity, item.product_id]);
    }

    if (coupon_code) {
      await client.query('UPDATE coupons SET used_count = used_count + 1 WHERE code = $1', [coupon_code]);
    }

    await client.query('COMMIT');
    res.status(201).json({
      success: true,
      data: { id: orderId, order_number: orderNumber },
      message: 'تم تقديم طلبك بنجاح',
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create order error:', err);
    if (err.message?.includes('Insufficient')) {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    client.release();
  }
}

async function getMyOrders(req, res) {
  try {
    // SQLite: no json_agg — fetch orders then items separately
    const ordersResult = await query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    const orders = await Promise.all(
      ordersResult.rows.map(async (order) => {
        const itemsResult = await query(
          'SELECT * FROM order_items WHERE order_id = $1', [order.id]
        );
        return { ...order, items: itemsResult.rows };
      })
    );

    res.json({ success: true, data: orders });
  } catch (err) {
    console.error('getMyOrders error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function getById(req, res) {
  try {
    const { id } = req.params;
    const orderResult = await query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = orderResult.rows[0];
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const itemsResult = await query('SELECT * FROM order_items WHERE order_id = $1', [id]);
    order.items = itemsResult.rows;

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function getAll(req, res) {
  try {
    const { page = 1, limit = 15, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    let whereClause = '';

    if (status) {
      whereClause = 'WHERE o.status = $1';
      params.push(status);
    }

    const countResult = await query(
      `SELECT COUNT(*) AS count FROM orders o ${whereClause}`, params
    );
    const ordersResult = await query(
      `SELECT o.*, u.first_name, u.last_name, u.email, u.phone AS user_phone
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, parseInt(limit), offset]
    );

    const orders = ordersResult.rows.map((o) => ({
      ...o,
      user: { first_name: o.first_name, last_name: o.last_name, email: o.email, phone: o.user_phone },
    }));

    const total = parseInt(countResult.rows[0]?.count || 0);
    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page), limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('getAll orders:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { create, getMyOrders, getById, getAll, updateStatus };
