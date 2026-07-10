import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Invitation token is missing.' }, { status: 400 });
    }

    const result = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isEmailVerified: users.isEmailVerified,
      isApproved: users.isApproved
    })
    .from(users)
    .where(eq(users.emailVerificationToken, token))
    .limit(1);

    const user = result[0];

    if (!user) {
      return NextResponse.json({ success: false, error: 'This invitation link is invalid or has expired.' }, { status: 400 });
    }

    if (user.isEmailVerified && user.isApproved) {
      return NextResponse.json({ success: false, error: 'This account is already activated. Please login instead.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Verify invitation lookup error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Unable to retrieve invitation details.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token, identityValue, password } = await request.json();

    if (!token || !identityValue || !password || String(password).length < 6) {
      return NextResponse.json({ success: false, error: 'All fields are required, and password must be at least 6 characters.' }, { status: 400 });
    }

    const result = await db.select().from(users).where(eq(users.emailVerificationToken, token)).limit(1);
    const user = result[0];

    if (!user) {
      return NextResponse.json({ success: false, error: 'This invitation link is invalid or has expired.' }, { status: 400 });
    }

    // Verify Employee ID or Phone Number
    const cleanedIdentity = String(identityValue).trim();
    const matchesId = String(user.id) === cleanedIdentity;
    const matchesPhone = user.phone && String(user.phone).trim() === cleanedIdentity;

    if (!matchesId && !matchesPhone) {
      return NextResponse.json({ success: false, error: 'Identity verification failed. The Employee ID or Phone Number is incorrect.' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(String(password));
    await db.update(users)
      .set({
        password: hashedPassword,
        isEmailVerified: true,
        isApproved: true,
        emailVerificationToken: null,
        emailVerifiedAt: new Date()
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true, message: 'Account activated successfully!' });
  } catch (error: any) {
    console.error('Verify invitation activation error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Unable to activate account right now.' }, { status: 500 });
  }
}
