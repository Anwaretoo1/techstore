import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    return NextResponse.json({ success: true, data: user });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    return NextResponse.json({ success: false, message: e.message }, { status: e.status || 401 });
  }
}
