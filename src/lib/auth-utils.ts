import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { query } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_production';

export function generateToken(payload: { id: number; role: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { id: number; role: string } {
  return jwt.verify(token, JWT_SECRET) as { id: number; role: string };
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

export async function requireAuth(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) throw Object.assign(new Error('Unauthorized'), { status: 401 });
  let decoded: { id: number; role: string };
  try {
    decoded = verifyToken(token);
  } catch {
    throw Object.assign(new Error('Invalid token'), { status: 401 });
  }
  const result = await query(
    'SELECT id, email, first_name, last_name, phone, role FROM users WHERE id = $1 AND is_active = true',
    [decoded.id]
  );
  if (result.rows.length === 0)
    throw Object.assign(new Error('User not found'), { status: 401 });
  return result.rows[0] as { id: number; email: string; first_name: string; last_name: string; phone: string; role: string };
}

export async function requireAdmin(req: NextRequest) {
  const user = await requireAuth(req);
  if (user.role !== 'admin')
    throw Object.assign(new Error('Admin access required'), { status: 403 });
  return user;
}
