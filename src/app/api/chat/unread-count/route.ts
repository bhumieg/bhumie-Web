import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({
        success: true,
        unreadCount: 0,
        recentUnread: [],
      });
    }

    // Find all conversations where the user is buyer or owner
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ buyerId: user.id }, { ownerId: user.id }],
        messages: {
          some: {
            isRead: false,
            senderId: { not: user.id },
          },
        },
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            images: true,
            locality: true,
            city: true,
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
      take: 6,
    });

    // Total unread count across all conversations
    const totalUnreadMessages = await prisma.chatMessage.count({
      where: {
        senderId: { not: user.id },
        isRead: false,
        conversation: {
          OR: [{ buyerId: user.id }, { ownerId: user.id }],
        },
      },
    });

    const recentUnread = conversations.map((c) => {
      const isOwner = c.ownerId === user.id;
      const otherUser = isOwner ? c.buyer : c.owner;
      return {
        id: c.id,
        propertyId: c.propertyId,
        propertyTitle: c.property?.title || 'Property Inquiry',
        propertyImage: c.property?.images?.[0] || null,
        otherUserName: otherUser?.name || otherUser?.email.split('@')[0] || 'User',
        otherUserAvatar: otherUser?.avatar || null,
        lastMessage: c.lastMessage || 'New message',
        lastMessageAt: c.lastMessageAt,
        unreadCount: c._count.messages,
      };
    });

    return NextResponse.json({
      success: true,
      unreadCount: totalUnreadMessages,
      unreadConversationsCount: conversations.length,
      recentUnread,
    });
  } catch (error: any) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error', unreadCount: 0, recentUnread: [] },
      { status: 500 }
    );
  }
}

