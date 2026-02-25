import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-utils';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await query(
      `SELECT p.*, c.name AS category_name, c.name_ar AS category_name_ar, c.slug AS category_slug, c.id AS cat_id
       FROM products p LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1 AND p.is_active = true`,
      [params.id]
    );
    if (result.rows.length === 0)
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });

    const row = result.rows[0];
    const [imagesRes, specsRes] = await Promise.all([
      query('SELECT * FROM product_images WHERE product_id = $1 ORDER BY is_primary DESC', [params.id]),
      query('SELECT * FROM product_specifications WHERE product_id = $1 ORDER BY sort_order', [params.id]),
    ]);

    const product = {
      ...row,
      price: parseFloat(row.price),
      sale_price: row.sale_price ? parseFloat(row.sale_price) : null,
      rating: parseFloat(row.rating || 0),
      tags: typeof row.tags === 'string' ? JSON.parse(row.tags || '[]') : (row.tags || []),
      images: imagesRes.rows,
      specifications: specsRes.rows,
      category: row.category_name ? { id: row.cat_id, name: row.category_name, name_ar: row.category_name_ar, slug: row.category_slug } : null,
    };
    return NextResponse.json({ success: true, data: product });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const { name, name_ar, description, description_ar, price, sale_price, sku, stock, category_id, brand, is_featured, is_active, tags, specifications } = body;
    const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : (tags || []);
    const parsedSpecs = typeof specifications === 'string' ? JSON.parse(specifications) : (specifications || []);

    const result = await query(
      `UPDATE products SET name=$1, name_ar=$2, description=$3, description_ar=$4,
       price=$5, sale_price=$6, sku=$7, stock=$8, category_id=$9, brand=$10,
       is_featured=$11, is_active=$12, tags=$13, updated_at=NOW() WHERE id=$14 RETURNING id`,
      [name, name_ar, description, description_ar, parseFloat(price), sale_price ? parseFloat(sale_price) : null,
       sku, parseInt(stock), parseInt(category_id), brand, !!is_featured, is_active !== false, JSON.stringify(parsedTags), params.id]
    );
    if (result.rows.length === 0)
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });

    await query('DELETE FROM product_specifications WHERE product_id = $1', [params.id]);
    for (let i = 0; i < parsedSpecs.length; i++) {
      const spec = parsedSpecs[i];
      await query(
        'INSERT INTO product_specifications (product_id, key, key_ar, value, value_ar, sort_order) VALUES ($1,$2,$3,$4,$5,$6)',
        [params.id, spec.key, spec.key_ar, spec.value, spec.value_ar, i]
      );
    }
    const parsedImages = typeof body.images === 'string' ? JSON.parse(body.images) : (body.images || []);
    await query('DELETE FROM product_images WHERE product_id = $1', [params.id]);
    for (let i = 0; i < parsedImages.length; i++) {
      const img = parsedImages[i];
      if (img.url) {
        await query(
          'INSERT INTO product_images (product_id, url, alt, is_primary, sort_order) VALUES ($1,$2,$3,$4,$5)',
          [params.id, img.url, img.alt || '', i === 0, i]
        );
      }
    }
    return NextResponse.json({ success: true, message: 'تم تحديث المنتج بنجاح' });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req);
    await query('UPDATE products SET is_active = false WHERE id = $1', [params.id]);
    return NextResponse.json({ success: true, message: 'تم حذف المنتج' });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
