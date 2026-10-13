import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        _count: {
          select: { properties: true, favorites: true, inquiries: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Mask PAN and Aadhaar for privacy
    const maskedPan = user.panNumber
      ? user.panNumber.length >= 10
        ? `${user.panNumber.substring(0, 3)}****${user.panNumber.substring(9)}`
        : '******'
      : null;

    const maskedAadhaar = user.aadhaarNumber
      ? user.aadhaarNumber.length >= 4
        ? `XXXX-XXXX-${user.aadhaarNumber.slice(-4)}`
        : 'XXXX-XXXX-****'
      : null;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        sellerVerified: user.sellerVerified,
        verificationStatus: user.verificationStatus,
        panMasked: maskedPan,
        aadhaarMasked: maskedAadhaar,
        hasSubmittedDocs: Boolean(user.panNumber || user.aadhaarNumber),
        propertiesCount: user._count.properties,
        favoritesCount: user._count.favorites,
        inquiriesCount: user._count.inquiries,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('get profile error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const dataToUpdate: any = {};

    if (body.name !== undefined) dataToUpdate.name = body.name.trim();
    if (body.phone !== undefined) dataToUpdate.phone = body.phone.trim();
    if (body.avatar !== undefined) dataToUpdate.avatar = body.avatar.trim();
    if (body.role && (body.role === 'USER' || body.role === 'OWNER')) {
      dataToUpdate.role = body.role;
    }

    // Seller verification submission
    if (body.panNumber !== undefined) {
      const panClean = body.panNumber.toUpperCase().trim();
      dataToUpdate.panNumber = panClean;
    }

    if (body.aadhaarNumber !== undefined) {
      const aadhaarClean = body.aadhaarNumber.replace(/\s+/g, '').trim();
      dataToUpdate.aadhaarNumber = aadhaarClean;
    }

    if (body.submitForVerification) {
      dataToUpdate.verificationStatus = 'PENDING';
    }

    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        sellerVerified: updatedUser.sellerVerified,
        verificationStatus: updatedUser.verificationStatus,
      },
    });
  } catch (error: any) {
    console.error('update profile error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error updating profile' },
      { status: 500 }
    );
  }
}
