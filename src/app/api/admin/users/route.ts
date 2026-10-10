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

    const users = await prisma.user.findMany({
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

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching users' },
      { status: 500 }
    );
  }
}
