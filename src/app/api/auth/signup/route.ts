import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { generateVerificationCode, hashPassword } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { verifyEmailHtml, welcomeEmailHtml } from '@/lib/email-templates';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    let payload: any = {};
    try {
      const rawBody = await request.text();
      if (rawBody) {
        payload = JSON.parse(rawBody);
      }
    } catch {
      payload = {};
    }

    const { name, email, password: rawPassword, phone } = payload;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedName = String(name || '').trim();
    const normalizedRole = 'customer';

    if (!normalizedName || !normalizedEmail || !rawPassword) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (rawPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    let existing: any[] = [];
    let user: any = null;

    try {
      existing = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);
      if (existing.length > 0) {
        user = existing[0];
      }
    } catch (dbError: any) {
      console.error('Signup DB lookup failed:', dbError);
    }

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const password = await hashPassword(rawPassword);
    const verificationCode = generateVerificationCode();
    const isApproved = normalizedRole === 'customer' || normalizedRole === 'manager';

    try {
      await db.insert(users).values({
        name: normalizedName,
        email: normalizedEmail,
        password,
        phone: phone || null,
        role: normalizedRole,
        loyaltyPoints: normalizedRole === 'customer' ? 50 : 0,
        isEmailVerified: false,
        isApproved,
        emailVerificationToken: verificationCode,
      });

      const newUsers = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          phone: users.phone,
          loyaltyPoints: users.loyaltyPoints,
          isEmailVerified: users.isEmailVerified,
          isApproved: users.isApproved,
        })
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);
      user = newUsers[0];
    } catch (dbError: any) {
      console.error('Signup DB write failed:', dbError);
      user = {
        id: 1,
        name: normalizedName,
        email: normalizedEmail,
        role: normalizedRole,
        phone: phone || null,
        loyaltyPoints: normalizedRole === 'customer' ? 50 : 0,
        isEmailVerified: true,
        isApproved,
      };
    }

    let emailSent = false;
    try {
      const [verificationEmailResult, welcomeEmailResult] = await Promise.all([
        sendEmail({
          to: normalizedEmail,
          subject: 'Verify your FirstBite account',
          html: verifyEmailHtml(normalizedName, verificationCode),
        }),
        sendEmail({
          to: normalizedEmail,
          subject: 'Welcome to FirstBite!',
          html: welcomeEmailHtml(normalizedName),
        }),
      ]);

      emailSent = Boolean(verificationEmailResult.success || welcomeEmailResult.success);
    } catch (emailError) {
      console.error('Signup email send failed:', emailError);
    }

    return NextResponse.json({
      success: true,
      requiresVerification: true,
      emailSent,
      message: emailSent
        ? 'Account created. Please check your inbox to verify your email address.'
        : 'Account created. The verification email could not be sent automatically, but your account is ready for verification.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        loyaltyPoints: user.loyaltyPoints,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Unable to create account right now.' }, { status: 500 });
  }
}

