import { NextResponse } from 'next/server';
import { createAdminToken } from '../../../../lib/auth';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return NextResponse.json(
        { error: 'Invalid login' },
        { status: 401 }
      );
    }

    const token = await createAdminToken();

    const res = NextResponse.json({
      ok: true
    });

    res.cookies.set('admin_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400,
      path: '/'
    });

    return res;
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}