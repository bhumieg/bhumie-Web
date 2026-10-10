import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const [
      totalProperties,
      activeProperties,
      pendingProperties,
      rentProperties,
      saleProperties,
      totalUsers,
      totalOwners,
      totalInquiries,
    ] = await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { status: 'ACTIVE' } }),
      prisma.property.count({ where: { status: 'PENDING' } }),
      prisma.property.count({ where: { purpose: 'RENT' } }),
      prisma.property.count({ where: { purpose: 'SALE' } }),
      prisma.user.count(),
      prisma.user.count({ where: { role: 'OWNER' } }),
      prisma.inquiry.count(),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalProperties,
        activeProperties,
        pendingProperties,
        rentProperties,
        saleProperties,
        totalUsers,
        totalOwners,
        totalInquiries,
      },
    });
  } catch (error: any) {
    console.error('admin stats error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching admin stats' },
      { status: 500 }
    );
  }
}
