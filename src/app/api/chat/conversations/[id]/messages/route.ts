import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(
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
    const body = await req.json();
    const { text } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { success: false, message: 'Message text cannot be empty' },
        { status: 400 }
      );
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, message: 'Conversation not found' },
        { status: 404 }
      );
    }

    if (conversation.buyerId !== user.id && conversation.ownerId !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized to post to this chat' },
        { status: 403 }
      );
    }

    const trimmedText = text.trim();

    // Create the message and update the conversation in a transaction
    const [newMessage] = await prisma.$transaction([
      prisma.chatMessage.create({
        data: {
          conversationId: id,
          senderId: user.id,
          text: trimmedText,
        },
        include: {
          sender: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.conversation.update({
        where: { id },
        data: {
          lastMessage: trimmedText,
          lastMessageAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: {
        id: newMessage.id,
        senderId: newMessage.senderId,
        senderName: newMessage.sender.name || newMessage.sender.email.split('@')[0],
        isMine: true,
        text: newMessage.text,
        isRead: false,
        createdAt: newMessage.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error posting message:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}

