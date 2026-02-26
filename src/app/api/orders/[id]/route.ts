import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(req);
    const orderResult = await query('SELECT * FROM orders WHERE id = $1', [params.id]);
    if (orderResult.rows.length === 0)
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });

    const order = orderResult.rows[0];
    if (user.role !== 'admin' && order.user_id !== user.id)
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });

    const items = await query('SELECT * FROM order_items WHERE order_id = $1', [params.id]);
    return NextResponse.json({ success: true, data: { ...order, items: items.rows } });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
