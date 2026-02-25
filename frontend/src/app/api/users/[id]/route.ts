import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-utils';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req);
    const result = await query(
      'SELECT id, email, first_name, last_name, phone, role, is_active, created_at FROM users WHERE id = $1',
      [params.id]
    );
    if (result.rows.length === 0)
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req);
    const { first_name, last_name, phone, is_active } = await req.json();
    const result = await query(
      'UPDATE users SET first_name=$1, last_name=$2, phone=$3, is_active=$4 WHERE id=$5 RETURNING id, email, first_name, last_name, phone, role, is_active',
      [first_name, last_name, phone, is_active !== false, params.id]
    );
    if (result.rows.length === 0)
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
