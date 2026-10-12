import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin only.' }, { status: 403 });
    }

    const { id } = await params;
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true, phone: true } },
        _count: { select: { inquiries: true, favorites: true } },
      },
    });

    if (!property) {
      return NextResponse.json({ success: false, message: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, property });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching property' },
      { status: 500 }
    );
  }
}

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

    // Basic details
    if (body.title !== undefined) dataToUpdate.title = body.title.trim();
    if (body.description !== undefined) dataToUpdate.description = body.description;
    if (body.propertyType !== undefined) dataToUpdate.propertyType = body.propertyType;
    if (body.purpose !== undefined) dataToUpdate.purpose = body.purpose;
    if (body.bhk !== undefined) dataToUpdate.bhk = body.bhk;
    if (body.carpetArea !== undefined) dataToUpdate.carpetArea = body.carpetArea ? parseInt(body.carpetArea) : null;
    if (body.furnishing !== undefined) dataToUpdate.furnishing = body.furnishing;

    // Pricing
    if (body.monthlyRent !== undefined) dataToUpdate.monthlyRent = body.monthlyRent ? parseFloat(body.monthlyRent) : null;
    if (body.securityDeposit !== undefined) dataToUpdate.securityDeposit = body.securityDeposit ? parseFloat(body.securityDeposit) : null;
    if (body.maintenance !== undefined) dataToUpdate.maintenance = body.maintenance ? parseFloat(body.maintenance) : null;
    if (body.priceValue !== undefined || body.monthlyRent !== undefined) {
      const priceVal = body.priceValue ? parseFloat(body.priceValue) : (body.monthlyRent ? parseFloat(body.monthlyRent) : 0);
      dataToUpdate.priceValue = priceVal;
      const purpose = body.purpose || 'RENT';
      dataToUpdate.priceDisplay = purpose === 'RENT'
        ? `₹${priceVal.toLocaleString('en-IN')} /month`
        : `₹${priceVal.toLocaleString('en-IN')}`;
    }

    // Specifications & Location
    if (body.bedrooms !== undefined) dataToUpdate.bedrooms = parseInt(body.bedrooms) || 1;
    if (body.bathrooms !== undefined) dataToUpdate.bathrooms = parseInt(body.bathrooms) || 1;
    if (body.address !== undefined) dataToUpdate.address = body.address;
    if (body.locality !== undefined) dataToUpdate.locality = body.locality;
    if (body.city !== undefined) dataToUpdate.city = body.city;
    if (body.state !== undefined) dataToUpdate.state = body.state;

    // Media & Amenities
    if (body.images !== undefined && Array.isArray(body.images)) dataToUpdate.images = body.images;
    if (body.amenities !== undefined && Array.isArray(body.amenities)) dataToUpdate.amenities = body.amenities;

    // Toggles & Status
    if (body.verified !== undefined) dataToUpdate.verified = Boolean(body.verified);
    if (body.featured !== undefined) dataToUpdate.featured = Boolean(body.featured);
    if (body.status !== undefined) dataToUpdate.status = body.status;

    // Owner info
    if (body.ownerName !== undefined) dataToUpdate.ownerName = body.ownerName;
    if (body.ownerEmail !== undefined) dataToUpdate.ownerEmail = body.ownerEmail;
    if (body.ownerPhone !== undefined) dataToUpdate.ownerPhone = body.ownerPhone;

    const updated = await prisma.property.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      message: 'Property updated successfully by Admin',
      property: updated,
    });
  } catch (error: any) {
    console.error('admin update property error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error updating property' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(req, context);
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
