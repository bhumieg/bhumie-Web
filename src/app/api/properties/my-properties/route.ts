import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const properties = await prisma.property.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            favorites: true,
            inquiries: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      total: properties.length,
      properties,
    });
  } catch (error: any) {
    console.error('my-properties error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch user properties' },
      { status: 500 }
    );
  }
}
