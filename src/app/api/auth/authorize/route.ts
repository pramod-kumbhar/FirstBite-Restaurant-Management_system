import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = body?.token;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Missing token' }, { status: 401 });
    }
    const payload = verifyToken(token);
    return NextResponse.json({ success: Boolean(payload), user: payload || null });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid authorization payload' }, { status: 401 });
  }
}
