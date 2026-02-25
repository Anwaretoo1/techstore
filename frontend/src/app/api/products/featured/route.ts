import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(
      `SELECT p.*, c.name AS category_name, c.name_ar AS category_name_ar, c.slug AS category_slug
       FROM products p LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.is_active = true AND p.is_featured = true
       ORDER BY p.created_at DESC LIMIT 8`
    );

    const products = await Promise.all(
      result.rows.map(async (row) => {
        const imagesRes = await query(
          'SELECT * FROM product_images WHERE product_id = $1 ORDER BY is_primary DESC LIMIT 1', [row.id]
        );
        return {
          ...row,
          price: parseFloat(row.price),
          sale_price: row.sale_price ? parseFloat(row.sale_price) : null,
          rating: parseFloat(row.rating || 0),
          tags: typeof row.tags === 'string' ? JSON.parse(row.tags || '[]') : (row.tags || []),
          images: imagesRes.rows,
          specifications: [],
          category: { id: row.category_id, name: row.category_name, name_ar: row.category_name_ar, slug: row.category_slug },
        };
      })
    );

    return NextResponse.json({ success: true, data: products });
  } catch (err) {
    console.error('featured error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
