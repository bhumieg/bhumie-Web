import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        isVerified: user.isVerified,
        avatar: user.avatar,
        sellerVerified: user.sellerVerified,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
