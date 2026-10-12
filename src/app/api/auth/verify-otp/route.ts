import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signJwtToken } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/brevo';

export async function POST(req: NextRequest) {
  try {
    const { email, otp, name, role = 'OWNER' } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify OTP record
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        email: normalizedEmail,
        otp: otp.trim(),
      },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP. Please check and try again.' },
        { status: 400 }
      );
    }

    if (new Date() > otpRecord.expiresAt) {
      await prisma.otpVerification.delete({ where: { id: otpRecord.id } });
      return NextResponse.json(
        { success: false, message: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // OTP is valid! Remove it
    await prisma.otpVerification.delete({ where: { id: otpRecord.id } });

    // Check if user exists or create
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: name?.trim() || normalizedEmail.split('@')[0],
          role: role === 'ADMIN' ? 'USER' : role, // Admin can only be created via admin key
          isVerified: true,
        },
      });

      // Send welcome email via Brevo in background
      sendWelcomeEmail(user.email, user.name || '').catch((err) =>
        console.error('Failed to send welcome email:', err)
      );
    } else {
      const dataToUpdate: any = { isVerified: true };
      if (name && name.trim()) {
        dataToUpdate.name = name.trim();
      }
      user = await prisma.user.update({
        where: { id: user.id },
        data: dataToUpdate,
      });
    }

    // Generate JWT token
    const token = signJwtToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name || undefined,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        isVerified: user.isVerified,
      },
    });

    // Set cookie for browser session
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error('verify-otp error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

