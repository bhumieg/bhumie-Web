import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function maskAadhaar(aadhaar?: string | null): string | null {
  if (!aadhaar) return null;
  const clean = aadhaar.replace(/\s+/g, '');
  if (clean.length < 4) return 'XXXX-XXXX-XXXX';
  return `XXXX-XXXX-${clean.slice(-4)}`;
}

function maskPan(pan?: string | null): string | null {
  if (!pan) return null;
  const clean = pan.trim().toUpperCase();
  if (clean.length < 5) return 'XXXXX****X';
  return `${clean.slice(0, 5)}****${clean.slice(-1)}`;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin only.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get('role'); // USER, OWNER, ADMIN, or all
    const statusFilter = searchParams.get('status'); // VERIFIED, PENDING, UNVERIFIED, REJECTED

    const whereClause: any = {};
    if (roleFilter && ['USER', 'OWNER', 'ADMIN'].includes(roleFilter.toUpperCase())) {
      whereClause.role = roleFilter.toUpperCase();
    }
    if (statusFilter && ['VERIFIED', 'PENDING', 'UNVERIFIED', 'REJECTED'].includes(statusFilter.toUpperCase())) {
      whereClause.verificationStatus = statusFilter.toUpperCase();
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            properties: true,
            favorites: true,
            inquiries: true,
          },
        },
      },
    });

    // Sanitize and mask sensitive identity credentials
    const sanitizedUsers = users.map((u) => ({
      ...u,
      aadhaarMasked: maskAadhaar(u.aadhaarNumber),
      panMasked: maskPan(u.panNumber),
      // Raw sensitive documents are restricted
      aadhaarNumber: undefined, // Do not expose full numbers
      panNumber: undefined,
    }));

    return NextResponse.json({ success: true, users: sanitizedUsers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching users' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin only.' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, role, isVerified, sellerVerified, verificationStatus } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (role && ['USER', 'OWNER', 'ADMIN'].includes(role)) {
      updateData.role = role;
    }
    if (typeof isVerified === 'boolean') {
      updateData.isVerified = isVerified;
    }
    if (typeof sellerVerified === 'boolean') {
      updateData.sellerVerified = sellerVerified;
    }
    if (verificationStatus && ['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'].includes(verificationStatus)) {
      updateData.verificationStatus = verificationStatus;
      if (verificationStatus === 'VERIFIED') {
        updateData.sellerVerified = true;
      } else if (verificationStatus === 'REJECTED' || verificationStatus === 'UNVERIFIED') {
        updateData.sellerVerified = false;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: {
        ...updatedUser,
        aadhaarMasked: maskAadhaar(updatedUser.aadhaarNumber),
        panMasked: maskPan(updatedUser.panNumber),
        aadhaarNumber: undefined,
        panNumber: undefined,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error updating user' },
      { status: 500 }
    );
  }
}
