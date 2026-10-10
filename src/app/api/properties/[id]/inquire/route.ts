import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params;
    const body = await req.json();
    const { name, phone, email, message } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, message: 'Name and Phone number are required' },
        { status: 400 }
      );
    }

    const authUser = await getAuthUser(req);

    const inquiry = await prisma.inquiry.create({
      data: {
        propertyId,
        userId: authUser ? authUser.id : null,
        name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : null,
        message: message?.trim() || 'I am interested in this property. Please contact me.',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Inquiry submitted successfully! The owner will contact you soon.',
      inquiry,
    });
  } catch (error: any) {
    console.error('inquire error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to submit inquiry' },
      { status: 500 }
    );
  }
}

