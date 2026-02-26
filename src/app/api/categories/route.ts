import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-utils';

export async function GET() {
  try {
    const result = await query(
      `SELECT c.*, COUNT(p.id) AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id AND p.is_active = true
       WHERE c.parent_id IS NULL
       GROUP BY c.id
       ORDER BY c.sort_order, c.name_ar`
    );
    return NextResponse.json({ success: true, data: result.rows.map(r => ({ ...r, product_count: parseInt(r.product_count) })) });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { name, name_ar, slug, description, image, parent_id, sort_order } = await req.json();
    const generatedSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    const result = await query(
      `INSERT INTO categories (name, name_ar, slug, description, image, parent_id, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, name_ar, generatedSlug, description, image, parent_id || null, sort_order || 0]
    );
    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string; code?: string };
    if (e.code === '23505') return NextResponse.json({ success: false, message: 'Slug already exists' }, { status: 409 });
    if (e.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
