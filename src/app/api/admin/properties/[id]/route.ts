import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin only.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const dataToUpdate: any = {};
    if (body.verified !== undefined) dataToUpdate.verified = Boolean(body.verified);
    if (body.featured !== undefined) dataToUpdate.featured = Boolean(body.featured);
    if (body.status !== undefined) dataToUpdate.status = body.status;

    const updated = await prisma.property.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      message: 'Property status updated',
      property: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error updating property' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin only.' }, { status: 403 });
    }

    const { id } = await params;
    await prisma.property.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Property deleted by Admin',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error deleting property' },
      { status: 500 }
    );
  }
}

