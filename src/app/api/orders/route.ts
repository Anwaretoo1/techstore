import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { requireAuth, requireAdmin } from '@/lib/auth-utils';

function generateOrderNumber() {
  const d = new Date();
  const y = d.getFullYear().toString().slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const r = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${y}${m}-${r}`;
}

export async function POST(req: NextRequest) {
  const client = await getClient();
  try {
    const user = await requireAuth(req);
    const { items, shipping_address, payment_method, subtotal, shipping_cost, discount, total, notes, coupon_code } = await req.json();

    if (!items || items.length === 0)
      return NextResponse.json({ success: false, message: 'No items provided' }, { status: 400 });

    await client.query('BEGIN');

    for (const item of items) {
      const stock = await client.query('SELECT stock FROM products WHERE id = $1 AND is_active = true', [item.product_id]);
      if (stock.rows.length === 0) throw new Error(`Product ${item.product_id} not found`);
      if (stock.rows[0].stock < item.quantity) throw new Error(`Insufficient stock`);
    }

    const orderNum = generateOrderNumber();
    const orderResult = await client.query(
      `INSERT INTO orders (order_number, user_id, payment_method, status, payment_status,
       subtotal, shipping_cost, discount, total, notes, coupon_code,
       shipping_full_name, shipping_phone, shipping_city, shipping_area, shipping_street, shipping_notes)
       VALUES ($1,$2,$3,'pending','pending',$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING id`,
      [orderNum, user.id, payment_method,
       parseFloat(subtotal || 0), parseFloat(shipping_cost || 0), parseFloat(discount || 0), parseFloat(total || 0),
       notes || null, coupon_code || null,
       shipping_address.full_name, shipping_address.phone, shipping_address.city,
       shipping_address.area, shipping_address.street, shipping_address.notes || null]
    );
    const orderId = orderResult.rows[0].id;

    for (const item of items) {
      const product = await client.query('SELECT name, name_ar FROM products WHERE id = $1', [item.product_id]);
      await client.query(
        'INSERT INTO order_items (order_id, product_id, product_name, product_name_ar, quantity, unit_price, total_price) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [orderId, item.product_id, product.rows[0].name, product.rows[0].name_ar, item.quantity, parseFloat(item.unit_price), parseFloat(item.unit_price) * item.quantity]
      );
      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [item.quantity, item.product_id]);
    }

    if (coupon_code) {
      await client.query('UPDATE coupons SET used_count = used_count + 1 WHERE code = $1', [coupon_code]);
    }

    await client.query('COMMIT');
    return NextResponse.json({ success: true, data: { id: orderId, order_number: orderNum }, message: 'تم تقديم طلبك بنجاح' }, { status: 201 });
  } catch (err: unknown) {
    await client.query('ROLLBACK');
    const e = err as { status?: number; message?: string };
    if (e.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: (e.message || 'Server error') }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAdmin(req);
    const p = req.nextUrl.searchParams;
    const page = parseInt(p.get('page') || '1');
    const limit = parseInt(p.get('limit') || '15');
    const status = p.get('status');
    const offset = (page - 1) * limit;
    const params: unknown[] = [];
    let where = '';
    if (status) { where = 'WHERE o.status = $1'; params.push(status); }

    const countResult = await query(`SELECT COUNT(*) AS count FROM orders o ${where}`, params);
    const ordersResult = await query(
      `SELECT o.*, u.first_name, u.last_name, u.email, u.phone AS user_phone
       FROM orders o LEFT JOIN users u ON u.id = o.user_id
       ${where} ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    const total = parseInt(countResult.rows[0]?.count || '0');
    return NextResponse.json({
      success: true,
      data: ordersResult.rows.map(o => ({ ...o, user: { first_name: o.first_name, last_name: o.last_name, email: o.email, phone: o.user_phone } })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
