import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Curated popular real estate hubs and localities in India (Delhi-NCR and major metros)
const POPULAR_LOCATIONS = [
  // Delhi NCR
  { name: 'Noida Sector 62', locality: 'Sector 62', city: 'Noida', state: 'Uttar Pradesh', lat: 28.6280, lng: 77.3649 },
  { name: 'Noida Sector 18', locality: 'Sector 18', city: 'Noida', state: 'Uttar Pradesh', lat: 28.5708, lng: 77.3261 },
  { name: 'Noida Sector 137', locality: 'Sector 137', city: 'Noida', state: 'Uttar Pradesh', lat: 28.5147, lng: 77.4087 },
  { name: 'Noida Sector 75', locality: 'Sector 75', city: 'Noida', state: 'Uttar Pradesh', lat: 28.5750, lng: 77.3789 },
  { name: 'Noida Extension (Greater Noida West)', locality: 'Gaur City / Greater Noida West', city: 'Greater Noida', state: 'Uttar Pradesh', lat: 28.6078, lng: 77.4328 },
  { name: 'Pari Chowk', locality: 'Pari Chowk', city: 'Greater Noida', state: 'Uttar Pradesh', lat: 28.4687, lng: 77.5097 },
  { name: 'Indirapuram', locality: 'Indirapuram', city: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.6415, lng: 77.3714 },
  { name: 'Vaishali', locality: 'Vaishali', city: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.6492, lng: 77.3398 },
  { name: 'Raj Nagar Extension', locality: 'Raj Nagar Extension', city: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.7056, lng: 77.4419 },
  { name: 'DLF Cyber City', locality: 'DLF Cyber City / Phase 2', city: 'Gurgaon', state: 'Haryana', lat: 28.4950, lng: 77.0895 },
  { name: 'Golf Course Road', locality: 'Golf Course Road, Sector 54', city: 'Gurgaon', state: 'Haryana', lat: 28.4410, lng: 77.1080 },
  { name: 'Sohna Road', locality: 'Sohna Road, Sector 48', city: 'Gurgaon', state: 'Haryana', lat: 28.4190, lng: 77.0390 },
  { name: 'Dwarka', locality: 'Dwarka Sector 12', city: 'New Delhi', state: 'Delhi', lat: 28.5921, lng: 77.0460 },
  { name: 'Saket', locality: 'Saket', city: 'New Delhi', state: 'Delhi', lat: 28.5244, lng: 77.2066 },
  { name: 'Vasant Kunj', locality: 'Vasant Kunj', city: 'New Delhi', state: 'Delhi', lat: 28.5293, lng: 77.1539 },
  { name: 'Rohini', locality: 'Rohini Sector 10', city: 'New Delhi', state: 'Delhi', lat: 28.7166, lng: 77.1145 },
  { name: 'South Extension', locality: 'South Extension Part 2', city: 'New Delhi', state: 'Delhi', lat: 28.5684, lng: 77.2215 },
  { name: 'Connaught Place', locality: 'Connaught Place', city: 'New Delhi', state: 'Delhi', lat: 28.6304, lng: 77.2177 },
  // Mumbai
  { name: 'Bandra West', locality: 'Bandra West', city: 'Mumbai', state: 'Maharashtra', lat: 19.0596, lng: 72.8295 },
  { name: 'Andheri West', locality: 'Andheri West', city: 'Mumbai', state: 'Maharashtra', lat: 19.1197, lng: 72.8464 },
  { name: 'Powai', locality: 'Powai / Hiranandani', city: 'Mumbai', state: 'Maharashtra', lat: 19.1176, lng: 72.9060 },
  { name: 'Thane West', locality: 'Thane West', city: 'Thane', state: 'Maharashtra', lat: 19.2183, lng: 72.9781 },
  // Bangalore
  { name: 'Whitefield', locality: 'Whitefield', city: 'Bangalore', state: 'Karnataka', lat: 12.9698, lng: 77.7500 },
  { name: 'HSR Layout', locality: 'HSR Layout Sector 1', city: 'Bangalore', state: 'Karnataka', lat: 12.9121, lng: 77.6446 },
  { name: 'Koramangala', locality: 'Koramangala 4th Block', city: 'Bangalore', state: 'Karnataka', lat: 12.9352, lng: 77.6245 },
  { name: 'Electronic City', locality: 'Electronic City Phase 1', city: 'Bangalore', state: 'Karnataka', lat: 12.8452, lng: 77.6602 },
  // Other Metros
  { name: 'Banjara Hills', locality: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', lat: 17.4156, lng: 78.4357 },
  { name: 'Hitec City', locality: 'Hitec City', city: 'Hyderabad', state: 'Telangana', lat: 17.4474, lng: 78.3762 },
  { name: 'Hinjawadi', locality: 'Hinjawadi Phase 1', city: 'Pune', state: 'Maharashtra', lat: 18.5913, lng: 73.7389 },
  { name: 'Gomti Nagar', locality: 'Gomti Nagar', city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8500, lng: 80.9990 },
  { name: 'Vaishali Nagar', locality: 'Vaishali Nagar', city: 'Jaipur', state: 'Rajasthan', lat: 26.9044, lng: 75.7483 },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || '').trim().toLowerCase();

    // 1. Fetch distinct localities and cities from existing properties in DB
    const dbProperties = await prisma.property.findMany({
      where: {
        status: 'ACTIVE',
        ...(query ? {
          OR: [
            { city: { contains: query, mode: 'insensitive' } },
            { locality: { contains: query, mode: 'insensitive' } },
            { title: { contains: query, mode: 'insensitive' } },
          ],
        } : {}),
      },
      select: {
        city: true,
        locality: true,
        latitude: true,
        longitude: true,
      },
      take: 20,
    });

    const results: Array<{
      id: string;
      label: string;
      locality: string;
      city: string;
      state?: string;
      lat?: number | null;
      lng?: number | null;
      type: 'property_location' | 'preset_locality';
    }> = [];

    const seen = new Set<string>();

    // Add matched locations from properties
    for (const prop of dbProperties) {
      const key = `${prop.locality || ''}, ${prop.city}`.toLowerCase().trim();
      if (key && !seen.has(key)) {
        seen.add(key);
        results.push({
          id: `db-${key}`,
          label: prop.locality ? `${prop.locality}, ${prop.city}` : prop.city,
          locality: prop.locality || prop.city,
          city: prop.city,
          lat: prop.latitude,
          lng: prop.longitude,
          type: 'property_location',
        });
      }
    }

    // Add matched locations from popular hubs
    for (const loc of POPULAR_LOCATIONS) {
      const match = !query || 
        loc.name.toLowerCase().includes(query) ||
        loc.locality.toLowerCase().includes(query) ||
        loc.city.toLowerCase().includes(query) ||
        loc.state.toLowerCase().includes(query);

      const key = `${loc.locality}, ${loc.city}`.toLowerCase();
      if (match && !seen.has(key)) {
        seen.add(key);
        results.push({
          id: `preset-${loc.name}`,
          label: `${loc.name}, ${loc.city}`,
          locality: loc.locality,
          city: loc.city,
          state: loc.state,
          lat: loc.lat,
          lng: loc.lng,
          type: 'preset_locality',
        });
      }
      if (results.length >= 10) break;
    }

    return NextResponse.json({ success: true, suggestions: results.slice(0, 10) });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching suggestions' },
      { status: 500 }
    );
  }
}

