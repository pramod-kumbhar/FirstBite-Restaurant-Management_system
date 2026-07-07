import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { randomBytes } from 'crypto';
import { eq } from 'drizzle-orm';
import { sendEmail } from '@/lib/email';
import { passwordResetHtml } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const result = await db.select().from(users).where(eq(users.email, normalizedEmail));
    const user = result[0];

    if (!user) {
      return NextResponse.json({ success: true, message: 'If an account exists, a reset email has been sent.' });
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await db.update(users)
      .set({
        passwordResetToken: token,
        passwordResetExpiresAt: expiresAt,
      })
      .where(eq(users.id, user.id));

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Reset your FirstBite password',
        html: passwordResetHtml(user.name || 'there', resetUrl),
      });
    } catch (emailError) {
      console.error('Forgot password email failed:', emailError);
    }

    return NextResponse.json({ success: true, message: 'If an account exists, a reset email has been sent.' });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Unable to process password reset right now.' }, { status: 500 });
  }
}

