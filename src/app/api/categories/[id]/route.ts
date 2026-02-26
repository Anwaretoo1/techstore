import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-utils';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await query('SELECT * FROM categories WHERE id = $1', [params.id]);
    if (result.rows.length === 0)
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req);
    const { name, name_ar, slug, description, image, sort_order } = await req.json();
    const result = await query(
      'UPDATE categories SET name=$1, name_ar=$2, slug=$3, description=$4, image=$5, sort_order=$6 WHERE id=$7 RETURNING *',
      [name, name_ar, slug, description, image, sort_order || 0, params.id]
    );
    if (result.rows.length === 0)
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req);
    await query('DELETE FROM categories WHERE id = $1', [params.id]);
    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
