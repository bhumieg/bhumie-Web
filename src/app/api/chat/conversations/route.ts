import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { buyerId: user.id },
          { ownerId: user.id },
        ],
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
        buyer: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        owner: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderId: { not: user.id },
              },
            },
          },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    const formatted = conversations.map((c) => {
      const isOwner = c.ownerId === user.id;
      const otherUser = isOwner ? c.buyer : c.owner;
      return {
        id: c.id,
        propertyId: c.propertyId,
        property: c.property,
        isOwner,
        otherUser,
        lastMessage: c.lastMessage,
        lastMessageAt: c.lastMessageAt,
        unreadCount: c._count.messages,
        createdAt: c.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      conversations: formatted,
      total: formatted.length,
    });
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}

