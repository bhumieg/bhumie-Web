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
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
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
            ownerPhone: true,
          },
        },
        buyer: {
          select: { id: true, name: true, email: true, phone: true, avatar: true },
        },
        owner: {
          select: { id: true, name: true, email: true, phone: true, avatar: true },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            senderId: true,
            text: true,
            isRead: true,
            createdAt: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, message: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Check if user is participant
    if (conversation.buyerId !== user.id && conversation.ownerId !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access to this chat' },
        { status: 403 }
      );
    }

    // Only mark unread messages sent by the other user as read IF any unread messages actually exist!
    const hasUnread = conversation.messages.some((m) => !m.isRead && m.senderId !== user.id);
    if (hasUnread) {
      await prisma.chatMessage.updateMany({
        where: {
          conversationId: id,
          senderId: { not: user.id },
          isRead: false,
        },
        data: { isRead: true },
      });
    }

    const isOwner = conversation.ownerId === user.id;
    const otherUser = isOwner ? conversation.buyer : conversation.owner;

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.id,
        propertyId: conversation.propertyId,
        property: conversation.property,
        buyerId: conversation.buyerId,
        ownerId: conversation.ownerId,
        isOwner,
        currentUser: { id: user.id, name: user.name, email: user.email, avatar: user.avatar },
        otherUser,
        messages: conversation.messages.map((m) => {
          const senderName =
            m.senderId === user.id
              ? user.name || user.email.split('@')[0]
              : otherUser.name || otherUser.email.split('@')[0];
          return {
            id: m.id,
            senderId: m.senderId,
            senderName,
            isMine: m.senderId === user.id,
            text: m.text,
            isRead: hasUnread && m.senderId !== user.id ? true : m.isRead,
            createdAt: m.createdAt,
          };
        }),
        createdAt: conversation.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error fetching conversation details:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}

