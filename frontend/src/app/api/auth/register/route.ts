import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { generateToken } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    const { email, password, first_name, last_name, phone } = await req.json();
    if (!email || !password || !first_name || !last_name)
      return NextResponse.json({ success: false, message: 'جميع الحقول مطلوبة' }, { status: 400 });

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0)
      return NextResponse.json({ success: false, message: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 409 });

    const password_hash = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
       VALUES ($1, $2, $3, $4, $5, 'customer')
       RETURNING id, email, first_name, last_name, phone, role`,
      [email.toLowerCase().trim(), password_hash, first_name, last_name, phone || null]
    );

    const user = result.rows[0];
    const token = generateToken({ id: user.id, role: user.role });
    return NextResponse.json({ success: true, data: { user, token } }, { status: 201 });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
