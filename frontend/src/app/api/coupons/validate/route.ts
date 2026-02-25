import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req);
    const { code } = await req.json();
    if (!code) return NextResponse.json({ success: false, message: 'الكود مطلوب' }, { status: 400 });

    const result = await query(
      `SELECT * FROM coupons
       WHERE code = $1
         AND is_active = true
         AND (expires_at IS NULL OR expires_at > NOW())
         AND (usage_limit IS NULL OR used_count < usage_limit)`,
      [code.toUpperCase()]
    );

    if (result.rows.length === 0)
      return NextResponse.json({ success: false, message: 'كود الخصم غير صالح أو منتهي الصلاحية' }, { status: 400 });

    const coupon = result.rows[0];
    return NextResponse.json({
      success: true,
      data: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: coupon.discount_value,
      },
    });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e.status) return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
