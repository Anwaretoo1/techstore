import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { generateToken } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json({ success: false, message: 'البريد وكلمة المرور مطلوبان' }, { status: 400 });

    const result = await query(
      'SELECT id, email, first_name, last_name, phone, role, password_hash, is_active FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0)
      return NextResponse.json({ success: false, message: 'بيانات الدخول غير صحيحة' }, { status: 401 });

    const user = result.rows[0];

    if (!user.is_active)
      return NextResponse.json({ success: false, message: 'الحساب موقوف' }, { status: 401 });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid)
      return NextResponse.json({ success: false, message: 'بيانات الدخول غير صحيحة' }, { status: 401 });

    const token = generateToken({ id: user.id, role: user.role });
    const { password_hash, ...userWithoutPassword } = user;

    return NextResponse.json({ success: true, data: { user: userWithoutPassword, token } });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
