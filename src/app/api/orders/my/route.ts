import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const ordersResult = await query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [user.id]
    );
    const orders = await Promise.all(
      ordersResult.rows.map(async (order) => {
        const items = await query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
        return { ...order, items: items.rows };
      })
    );
    return NextResponse.json({ success: true, data: orders });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
