import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password || String(password).length < 6) {
      return NextResponse.json({ success: false, error: 'A valid reset token and a password of at least 6 characters are required.' }, { status: 400 });
    }

    const result = await db.select().from(users).where(eq(users.passwordResetToken, token));
    const user = result[0];

    if (!user || !user.passwordResetExpiresAt || new Date(user.passwordResetExpiresAt).getTime() < Date.now()) {
      return NextResponse.json({ success: false, error: 'This password reset link is invalid or has expired.' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(String(password));
    await db.update(users)
      .set({
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true, message: 'Password updated successfully.' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Unable to reset password right now.' }, { status: 500 });
  }
}
