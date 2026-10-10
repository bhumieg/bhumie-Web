import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required to start chat' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { propertyId } = body;

    if (!propertyId) {
      return NextResponse.json(
        { success: false, message: 'Property ID is required' },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        owner: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, message: 'Property not found' },
        { status: 404 }
      );
    }

    // Check if buyer is trying to chat with themselves
    if (property.ownerId === user.id) {
      return NextResponse.json({
        success: true,
        isSelf: true,
        message: 'This is your own property listing',
        property: {
          id: property.id,
          title: property.title,
          priceDisplay: property.priceDisplay,
          images: property.images,
        },
      });
    }

    // Find or create conversation
    let conversation = await prisma.conversation.findUnique({
      where: {
        propertyId_buyerId: {
          propertyId: property.id,
          buyerId: user.id,
        },
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            priceDisplay: true,
            locality: true,
            city: true,
            images: true,
            propertyType: true,
          },
        },
        owner: {
          select: { id: true, name: true, email: true, phone: true },
        },
        buyer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          propertyId: property.id,
          buyerId: user.id,
          ownerId: property.ownerId,
          lastMessage: 'Hi, I am interested in this property.',
          lastMessageAt: new Date(),
          messages: {
            create: {
              senderId: user.id,
              text: 'Hi, I am interested in this property. Is it still available?',
            },
          },
        },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              priceDisplay: true,
              locality: true,
              city: true,
              images: true,
              propertyType: true,
            },
          },
          owner: {
            select: { id: true, name: true, email: true, phone: true },
          },
          buyer: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      conversation,
    });
  } catch (error: any) {
    console.error('Error starting chat conversation:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}

