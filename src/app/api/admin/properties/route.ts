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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (search.trim()) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { locality: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { ownerEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    const properties = await prisma.property.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { inquiries: true, favorites: true },
        },
      },
    });

    return NextResponse.json({ success: true, properties });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching admin properties' },
      { status: 500 }
    );
  }
}
