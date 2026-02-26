import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin, getTokenFromRequest, verifyToken } from '@/lib/auth-utils';

function buildProduct(row: Record<string, unknown>, images: unknown[] = [], specs: unknown[] = []) {
  return {
    ...row,
    price: parseFloat(row.price as string),
    sale_price: row.sale_price ? parseFloat(row.sale_price as string) : null,
    rating: parseFloat((row.rating as string) || '0'),
    images,
    specifications: specs,
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags || '[]') : (row.tags || []),
  };
}

export async function GET(req: NextRequest) {
  try {
    const p = req.nextUrl.searchParams;
    const category = p.get('category');
    const brand = p.get('brand');
    const search = p.get('search');
    const sort = p.get('sort') || 'newest';
    const minPrice = p.get('minPrice');
    const maxPrice = p.get('maxPrice');
    const page = parseInt(p.get('page') || '1');
    const limit = parseInt(p.get('limit') || '12');
    const featured = p.get('featured');
    const sale = p.get('sale');
    const offset = (page - 1) * limit;

    const conditions: string[] = ['p.is_active = true'];
    const params: unknown[] = [];
    let idx = 1;

    if (category) { conditions.push(`c.slug = $${idx++}`); params.push(category); }
    if (brand) { conditions.push(`p.brand ILIKE $${idx++}`); params.push(`%${brand}%`); }
    if (search) {
      conditions.push(`(p.name ILIKE $${idx++} OR p.name_ar ILIKE $${idx++} OR p.description_ar ILIKE $${idx++})`);
      const sv = `%${search}%`;
      params.push(sv, sv, sv);
    }
    if (minPrice) { conditions.push(`COALESCE(p.sale_price, p.price) >= $${idx++}`); params.push(parseFloat(minPrice)); }
    if (maxPrice) { conditions.push(`COALESCE(p.sale_price, p.price) <= $${idx++}`); params.push(parseFloat(maxPrice)); }
    if (featured === 'true') conditions.push('p.is_featured = true');
    if (sale === 'true') conditions.push('p.sale_price IS NOT NULL AND p.sale_price < p.price');

    const where = `WHERE ${conditions.join(' AND ')}`;
    const sortMap: Record<string, string> = {
      newest: 'p.created_at DESC',
      popular: 'p.review_count DESC',
      price_asc: 'COALESCE(p.sale_price, p.price) ASC',
      price_desc: 'COALESCE(p.sale_price, p.price) DESC',
    };
    const orderBy = sortMap[sort] || 'p.created_at DESC';

    const countResult = await query(
      `SELECT COUNT(*) AS count FROM products p LEFT JOIN categories c ON p.category_id = c.id ${where}`,
      params
    );
    const productsResult = await query(
      `SELECT p.*, c.name AS category_name, c.name_ar AS category_name_ar, c.slug AS category_slug
       FROM products p LEFT JOIN categories c ON p.category_id = c.id
       ${where} ORDER BY ${orderBy} LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset]
    );

    const products = await Promise.all(
      productsResult.rows.map(async (row) => {
        const [imagesRes, specsRes] = await Promise.all([
          query('SELECT * FROM product_images WHERE product_id = $1 ORDER BY is_primary DESC', [row.id]),
          query('SELECT * FROM product_specifications WHERE product_id = $1 ORDER BY sort_order', [row.id]),
        ]);
        return buildProduct(
          { ...row, category: row.category_name ? { id: row.category_id, name: row.category_name, name_ar: row.category_name_ar, slug: row.category_slug } : null },
          imagesRes.rows, specsRes.rows
        );
      })
    );

    const total = parseInt(countResult.rows[0]?.count || '0');
    return NextResponse.json({ success: true, data: products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error('products GET error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const { name, name_ar, description, description_ar, price, sale_price, sku, stock, category_id, brand, is_featured, is_active, tags, specifications } = body;

    const skuCheck = await query('SELECT id FROM products WHERE sku = $1', [sku]);
    if (skuCheck.rows.length > 0)
      return NextResponse.json({ success: false, message: 'SKU already exists' }, { status: 409 });

    const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : (tags || []);
    const parsedSpecs = typeof specifications === 'string' ? JSON.parse(specifications) : (specifications || []);

    const productResult = await query(
      `INSERT INTO products (name, name_ar, description, description_ar, price, sale_price, sku, stock, category_id, brand, is_featured, is_active, tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
      [name, name_ar, description, description_ar, parseFloat(price), sale_price ? parseFloat(sale_price) : null,
       sku, parseInt(stock), parseInt(category_id), brand, !!is_featured, is_active !== false, JSON.stringify(parsedTags)]
    );
    const productId = productResult.rows[0].id;

    for (let i = 0; i < parsedSpecs.length; i++) {
      const spec = parsedSpecs[i];
      await query(
        'INSERT INTO product_specifications (product_id, key, key_ar, value, value_ar, sort_order) VALUES ($1,$2,$3,$4,$5,$6)',
        [productId, spec.key, spec.key_ar, spec.value, spec.value_ar, i]
      );
    }
    const parsedImages = typeof body.images === 'string' ? JSON.parse(body.images) : (body.images || []);
    for (let i = 0; i < parsedImages.length; i++) {
      const img = parsedImages[i];
      if (img.url) {
        await query(
          'INSERT INTO product_images (product_id, url, alt, is_primary, sort_order) VALUES ($1,$2,$3,$4,$5)',
          [productId, img.url, img.alt || '', i === 0, i]
        );
      }
    }
    return NextResponse.json({ success: true, data: { id: productId }, message: 'تم إنشاء المنتج بنجاح' }, { status: 201 });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
