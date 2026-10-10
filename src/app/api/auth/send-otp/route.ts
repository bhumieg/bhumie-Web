import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateOtp, sendOtpEmail } from '@/lib/brevo';

export async function POST(req: NextRequest) {
  try {
    const { email, purpose = 'Login' } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Clean up old OTPs for this email
    await prisma.otpVerification.deleteMany({
      where: { email: normalizedEmail },
    });

    // Save new OTP
    await prisma.otpVerification.create({
      data: {
        email: normalizedEmail,
        otp,
        purpose,
        expiresAt,
      },
    });

    // Send email via Brevo
    const emailResult = await sendOtpEmail(normalizedEmail, otp, purpose);

    // If BREVO_API_KEY is not configured, also return devOtp in response for convenient testing
    const isDevMode = !process.env.BREVO_API_KEY || process.env.BREVO_API_KEY.includes('your_brevo');

    return NextResponse.json({
      success: true,
      message: `OTP sent to ${normalizedEmail}`,
      devOtp: isDevMode ? otp : undefined,
      emailSent: emailResult.success,
    });
  } catch (error: any) {
    console.error('send-otp error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

