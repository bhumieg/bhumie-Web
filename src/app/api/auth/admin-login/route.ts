import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signJwtToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, secretKey } = await req.json();

    const expectedSecret = process.env.ADMIN_SECRET_KEY || 'admin@ghar24#secure2026';

    if (!secretKey || secretKey.trim() !== expectedSecret.trim()) {
      return NextResponse.json(
        { success: false, message: 'Invalid Admin Secret Key' },
        { status: 401 }
      );
    }

    const adminEmail = (email && email.includes('@')) ? email.toLowerCase().trim() : 'admin@ghar24.com';

    // Find or create admin user
    let user = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: adminEmail,
          name: 'Super Admin',
          role: 'ADMIN',
          isVerified: true,
        },
      });
    } else if (user.role !== 'ADMIN') {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN', isVerified: true },
      });
    }

    const token = signJwtToken({
      userId: user.id,
      email: user.email,
      role: 'ADMIN',
      name: user.name || 'Super Admin',
    });

    const response = NextResponse.json({
      success: true,
      message: 'Admin access granted',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('admin-login error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

