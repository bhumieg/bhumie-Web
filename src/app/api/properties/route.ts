import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { getOptimizedImageUrl } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') || '';
    const city = searchParams.get('city') || '';
    const locality = searchParams.get('locality') || '';
    const propertyType = searchParams.get('propertyType') || '';
    const purpose = searchParams.get('purpose') || ''; // RENT or SALE
    const bhk = searchParams.get('bhk') || '';
    const furnishing = searchParams.get('furnishing') || '';
    const floor = searchParams.get('floor') || '';
    const balconies = searchParams.get('balconies') ? parseInt(searchParams.get('balconies')!) : undefined;
    const hasLift = searchParams.get('hasLift') === 'true';
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const featured = searchParams.get('featured') === 'true';
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined;
    const radius = searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : 35; // 35 km default radius
    const sortBy = searchParams.get('sortBy') || 'newest';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'ACTIVE',
    };

    if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
      const latDelta = radius / 111;
      const lngDelta = radius / (111 * Math.cos((lat * Math.PI) / 180));
      where.latitude = { gte: lat - latDelta, lte: lat + latDelta };
      where.longitude = { gte: lng - lngDelta, lte: lng + lngDelta };
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (locality) {
      where.locality = { contains: locality, mode: 'insensitive' };
    }

    if (propertyType && propertyType !== 'All') {
      where.propertyType = { equals: propertyType, mode: 'insensitive' };
    }

    if (purpose && (purpose === 'RENT' || purpose === 'SALE')) {
      where.purpose = purpose;
    }

    if (bhk && bhk !== 'All') {
      where.bhk = bhk;
    }

    if (furnishing && furnishing !== 'All') {
      where.furnishing = furnishing;
    }

    if (floor && floor !== 'All') {
      if (floor.toLowerCase().includes('ground')) {
        where.floor = { contains: 'Ground', mode: 'insensitive' };
      } else {
        where.floor = { contains: floor, mode: 'insensitive' };
      }
    }

    if (balconies !== undefined && balconies > 0) {
      where.balconies = { gte: balconies };
    }

    if (hasLift) {
      where.OR = [
        ...(where.OR || []),
        { hasLift: true },
        { amenities: { has: 'Lift' } },
      ];
    }

    if (featured) {
      where.featured = true;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.priceValue = {};
      if (minPrice !== undefined) where.priceValue.gte = minPrice;
      if (maxPrice !== undefined) where.priceValue.lte = maxPrice;
    }

    if (search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { locality: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'priceAsc') orderBy = { priceValue: 'asc' };
    else if (sortBy === 'priceDesc') orderBy = { priceValue: 'desc' };

    const [total, properties] = await Promise.all([
      prisma.property.count({ where }),
      prisma.property.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      properties,
    });
  } catch (error: any) {
    console.error('get properties error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Please login to post a property.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      propertyType = 'Flat',
      purpose = 'RENT', // RENT or SALE
      bhk = '2 BHK',
      carpetArea,
      furnishing = 'Semi Furnished',
      monthlyRent,
      securityDeposit,
      maintenance,
      otherCharges,
      priceValue,
      bedrooms = 2,
      bathrooms = 2,
      floor,
      totalFloors,
      balconies = 0,
      hasLift = false,
      roadWidth,
      availableFrom,
      ageOfProperty,
      address,
      locality = 'Sector 62',
      city = 'Noida',
      state = 'Uttar Pradesh',
      pincode,
      latitude,
      longitude,
      images = [],
      videoUrl,
      amenities = [],
      ownerPhone,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, message: 'Property title is required' },
        { status: 400 }
      );
    }

    // Determine numeric price and display string
    const finalPriceValue = priceValue ? parseFloat(priceValue) : (monthlyRent ? parseFloat(monthlyRent) : 0);
    const finalPriceDisplay =
      purpose === 'RENT'
        ? `₹${finalPriceValue.toLocaleString('en-IN')} /month`
        : `₹${finalPriceValue.toLocaleString('en-IN')}`;

    // Provide default placeholder images if none provided
    const propertyImages = Array.isArray(images) && images.length > 0
      ? images.map((img: string) => getOptimizedImageUrl(img))
      : [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        ];

    const newProperty = await prisma.property.create({
      data: {
        title: title.trim(),
        description: description?.trim() || `Beautiful ${bhk} ${propertyType} available in ${locality}, ${city}.`,
        propertyType,
        purpose: purpose === 'SALE' ? 'SALE' : 'RENT',
        bhk,
        carpetArea: carpetArea ? parseInt(carpetArea) : null,
        furnishing,
        monthlyRent: monthlyRent ? parseFloat(monthlyRent) : null,
        securityDeposit: securityDeposit ? parseFloat(securityDeposit) : null,
        maintenance: maintenance ? parseFloat(maintenance) : null,
        otherCharges: otherCharges || null,
        priceValue: finalPriceValue,
        priceDisplay: finalPriceDisplay,
        bedrooms: parseInt(bedrooms) || 1,
        bathrooms: parseInt(bathrooms) || 1,
        floor: floor || '2nd Floor',
        totalFloors: totalFloors || null,
        balconies: balconies !== undefined ? parseInt(balconies) : 0,
        hasLift: Boolean(hasLift),
        roadWidth: roadWidth?.trim() || null,
        availableFrom: availableFrom || 'Immediate',
        ageOfProperty: ageOfProperty || '0-1 Year',
        address: address || `${locality}, ${city}`,
        locality: locality.trim(),
        city: city.trim(),
        state: state?.trim() || 'Delhi-NCR',
        pincode: pincode || null,
        latitude: latitude ? parseFloat(latitude) : 28.6280,
        longitude: longitude ? parseFloat(longitude) : 77.3649,
        images: propertyImages,
        videoUrl: videoUrl || null,
        amenities: Array.isArray(amenities) ? amenities : [],
        verified: false,
        featured: false,
        status: 'ACTIVE',
        ownerId: user.id,
        ownerName: user.name || 'Owner',
        ownerEmail: user.email,
        ownerPhone: ownerPhone || user.phone || '+91 98765 43210',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Property created successfully',
      property: newProperty,
    });
  } catch (error: any) {
    console.error('create property error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create property' },
      { status: 500 }
    );
  }
}
