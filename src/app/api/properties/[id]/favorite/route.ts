import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Please login to save favorites' }, { status: 401 });
    }

    const { id: propertyId } = await params;

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId: user.id,
          propertyId,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({
        success: true,
        isFavorite: false,
        message: 'Removed from favorites',
      });
    } else {
      await prisma.favorite.create({
        data: {
          userId: user.id,
          propertyId,
        },
      });
      return NextResponse.json({
        success: true,
        isFavorite: true,
        message: 'Saved to favorites',
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error updating favorite' },
      { status: 500 }
    );
  }
}

