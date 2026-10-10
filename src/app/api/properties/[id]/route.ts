import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, message: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, property });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching property' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.property.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Property not found' }, { status: 404 });
    }

    // Only owner of this property or an Admin can update
    if (existing.ownerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. You do not have permission to edit this listing.' },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Recalculate price display if updated
    let priceValue = body.priceValue !== undefined ? parseFloat(body.priceValue) : existing.priceValue;
    if (body.monthlyRent !== undefined && !body.priceValue) {
      priceValue = parseFloat(body.monthlyRent);
    }
    const purpose = body.purpose || existing.purpose;
    const priceDisplay =
      purpose === 'RENT'
        ? `₹${priceValue.toLocaleString('en-IN')} /month`
        : `₹${priceValue.toLocaleString('en-IN')}`;

    const updated = await prisma.property.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : existing.title,
        description: body.description !== undefined ? body.description : existing.description,
        propertyType: body.propertyType !== undefined ? body.propertyType : existing.propertyType,
        purpose: purpose,
        bhk: body.bhk !== undefined ? body.bhk : existing.bhk,
        carpetArea: body.carpetArea !== undefined ? parseInt(body.carpetArea) : existing.carpetArea,
        furnishing: body.furnishing !== undefined ? body.furnishing : existing.furnishing,
        monthlyRent: body.monthlyRent !== undefined ? parseFloat(body.monthlyRent) : existing.monthlyRent,
        securityDeposit: body.securityDeposit !== undefined ? parseFloat(body.securityDeposit) : existing.securityDeposit,
        maintenance: body.maintenance !== undefined ? parseFloat(body.maintenance) : existing.maintenance,
        otherCharges: body.otherCharges !== undefined ? body.otherCharges : existing.otherCharges,
        priceValue,
        priceDisplay,
        bedrooms: body.bedrooms !== undefined ? parseInt(body.bedrooms) : existing.bedrooms,
        bathrooms: body.bathrooms !== undefined ? parseInt(body.bathrooms) : existing.bathrooms,
        floor: body.floor !== undefined ? body.floor : existing.floor,
        totalFloors: body.totalFloors !== undefined ? body.totalFloors : existing.totalFloors,
        availableFrom: body.availableFrom !== undefined ? body.availableFrom : existing.availableFrom,
        ageOfProperty: body.ageOfProperty !== undefined ? body.ageOfProperty : existing.ageOfProperty,
        address: body.address !== undefined ? body.address : existing.address,
        locality: body.locality !== undefined ? body.locality : existing.locality,
        city: body.city !== undefined ? body.city : existing.city,
        state: body.state !== undefined ? body.state : existing.state,
        pincode: body.pincode !== undefined ? body.pincode : existing.pincode,
        latitude: body.latitude !== undefined ? parseFloat(body.latitude) : existing.latitude,
        longitude: body.longitude !== undefined ? parseFloat(body.longitude) : existing.longitude,
        images: body.images !== undefined ? body.images : existing.images,
        videoUrl: body.videoUrl !== undefined ? body.videoUrl : existing.videoUrl,
        amenities: body.amenities !== undefined ? body.amenities : existing.amenities,
        ownerPhone: body.ownerPhone !== undefined ? body.ownerPhone : existing.ownerPhone,
        status: body.status !== undefined ? body.status : existing.status,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Property updated successfully',
      property: updated,
    });
  } catch (error: any) {
    console.error('update property error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update property' },
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
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.property.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Property not found' }, { status: 404 });
    }

    // Only owner or Admin can delete
    if (existing.ownerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. You do not have permission to delete this listing.' },
        { status: 403 }
      );
    }

    await prisma.property.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error: any) {
    console.error('delete property error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete property' },
      { status: 500 }
    );
  }
}
