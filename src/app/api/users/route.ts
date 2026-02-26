import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const p = req.nextUrl.searchParams;
    const page = parseInt(p.get('page') || '1');
    const limit = parseInt(p.get('limit') || '20');
    const offset = (page - 1) * limit;

    const countResult = await query("SELECT COUNT(*) AS count FROM users WHERE role = 'customer'");
    const result = await query(
      `SELECT id, email, first_name, last_name, phone, role, is_active, created_at
       FROM users WHERE role = 'customer'
       ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const total = parseInt(countResult.rows[0].count);
    return NextResponse.json({ success: true, data: result.rows, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
