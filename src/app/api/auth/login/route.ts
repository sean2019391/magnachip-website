import { NextResponse } from 'next/server';
import { createAdminToken } from '@/lib/admin-auth.server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = body?.password;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

    if (typeof password !== 'string' || password.trim() === '') {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const token = createAdminToken();
    const res = NextResponse.json({ success: true });
    res.cookies.set('admin_session', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return res;
  } catch (err) {
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 });
  }
}
