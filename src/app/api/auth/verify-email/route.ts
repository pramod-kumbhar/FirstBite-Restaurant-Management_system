import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const code = String(body.code || '').trim();

    if (!email || !code) {
      return NextResponse.json({ success: false, error: 'Email and OTP code are required' }, { status: 400 });
    }

    const matches = await db.select().from(users).where(eq(users.email, email));
    const user = matches[0];

    if (!user || user.emailVerificationToken !== code) {
      return NextResponse.json({ success: false, error: 'Invalid email or OTP code' }, { status: 404 });
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ success: true, message: 'Your email is already verified.' });
    }

    await db.update(users).set({
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerifiedAt: new Date(),
    }).where(eq(users.id, user.id));

    return NextResponse.json({ success: true, message: 'Your email address has been verified successfully.' });
  } catch (error: any) {
    console.error('Verify email error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
