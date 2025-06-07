import { auth } from '@clerk/nextjs/server';
import { db, chats, messages } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const userChats = await db
            .select({
                id: chats.id,
                title: chats.title,
                createdAt: chats.createdAt,
                updatedAt: chats.updatedAt,
            })
            .from(chats)
            .where(eq(chats.userId, userId))
            .orderBy(desc(chats.updatedAt));

        return Response.json(userChats);
    } catch (error) {
        console.error('Get chats error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const body = await req.json();
        const { title } = body;

        const newChat = await db.insert(chats).values({
            userId,
            title: title || 'New Chat',
        }).returning();

        return Response.json(newChat[0]);
    } catch (error) {
        console.error('Create chat error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { searchParams } = new URL(req.url);
        const chatId = searchParams.get('chatId');

        if (!chatId) {
            return new Response(JSON.stringify({ error: 'Chat ID required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Verify chat belongs to user
        const chat = await db
            .select()
            .from(chats)
            .where(eq(chats.id, chatId))
            .limit(1);

        if (chat.length === 0) {
            return new Response(JSON.stringify({ error: 'Chat not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (chat[0].userId !== userId) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Delete messages first (if not using CASCADE)
        await db.delete(messages).where(eq(messages.chatId, chatId));

        // Delete the chat
        await db.delete(chats).where(eq(chats.id, chatId));

        return Response.json({ success: true });
    } catch (error) {
        console.error('Delete chat error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}