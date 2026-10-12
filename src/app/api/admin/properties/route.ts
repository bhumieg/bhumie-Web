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

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin only.' }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      description,
      propertyType = 'Flat',
      purpose = 'RENT',
      bhk = '2 BHK',
      carpetArea,
      furnishing = 'Semi Furnished',
      monthlyRent,
      securityDeposit,
      maintenance,
      priceValue,
      bedrooms = 2,
      bathrooms = 2,
      address,
      locality = 'Sector 62',
      city = 'Noida',
      state = 'Uttar Pradesh',
      images = [],
      amenities = [],
      verified = true,
      featured = false,
      status = 'ACTIVE',
      ownerName,
      ownerEmail,
      ownerPhone,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, message: 'Property title is required' }, { status: 400 });
    }

    const numericPrice = priceValue ? parseFloat(priceValue) : (monthlyRent ? parseFloat(monthlyRent) : 0);
    const displayPrice =
      purpose === 'RENT'
        ? `₹${numericPrice.toLocaleString('en-IN')} /month`
        : `₹${numericPrice.toLocaleString('en-IN')}`;

    const newProperty = await prisma.property.create({
      data: {
        title: title.trim(),
        description: description?.trim() || `${bhk} ${propertyType} in ${locality}, ${city}.`,
        propertyType,
        purpose: purpose === 'SALE' ? 'SALE' : 'RENT',
        bhk,
        carpetArea: carpetArea ? parseInt(carpetArea) : null,
        furnishing,
        monthlyRent: monthlyRent ? parseFloat(monthlyRent) : numericPrice,
        securityDeposit: securityDeposit ? parseFloat(securityDeposit) : null,
        maintenance: maintenance ? parseFloat(maintenance) : null,
        priceValue: numericPrice,
        priceDisplay: displayPrice,
        bedrooms: parseInt(bedrooms) || 1,
        bathrooms: parseInt(bathrooms) || 1,
        address: address || `${locality}, ${city}`,
        locality,
        city,
        state,
        images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'],
        amenities: Array.isArray(amenities) ? amenities : [],
        verified: Boolean(verified),
        featured: Boolean(featured),
        status: status || 'ACTIVE',
        ownerId: user.id,
        ownerName: ownerName || user.name || 'Admin',
        ownerEmail: ownerEmail || user.email,
        ownerPhone: ownerPhone || '+91 98765 43210',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Property created successfully by Admin',
      property: newProperty,
    });
  } catch (error: any) {
    console.error('admin create property error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error creating property' },
      { status: 500 }
    );
  }
}
