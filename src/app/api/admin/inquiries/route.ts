import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin only.' }, { status: 403 });
    }

    const inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            locality: true,
            city: true,
            priceDisplay: true,
            ownerEmail: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, inquiries });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching inquiries' },
      { status: 500 }
    );
  }
}
