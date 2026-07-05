import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Verification token is required' }, { status: 400 });
    }

    const matches = await db.select().from(users).where(eq(users.emailVerificationToken, token));
    const user = matches[0];

    if (!user) {
      return NextResponse.json({ success: false, error: 'This verification link is invalid or has expired.' }, { status: 404 });
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
