import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { generateVerificationCode } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { verifyEmailHtml } from '@/lib/email-templates';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const userMatches = await db.select().from(users).where(eq(users.email, email));
    const user = userMatches[0];
    if (!user) {
      return NextResponse.json({ success: false, error: 'No account found with that email' }, { status: 404 });
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ success: true, message: 'Your email is already verified.' });
    }

    const verificationCode = generateVerificationCode();
    await db.update(users).set({ emailVerificationToken: verificationCode }).where(eq(users.id, user.id));

    const emailResult = await sendEmail({
      to: user.email,
      subject: 'Your OTP code for FirstBite verification',
      html: verifyEmailHtml(user.name, verificationCode),
    });

    return NextResponse.json({
      success: true,
      emailSent: Boolean(emailResult.success),
      message: emailResult.success
        ? 'OTP resent successfully. Check your inbox.'
        : 'OTP generated but email could not be delivered. Please try again later.',
    });
  } catch (error: any) {
    console.error('Resend OTP error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Unable to resend OTP.' }, { status: 500 });
  }
}

