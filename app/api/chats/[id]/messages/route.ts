import { auth } from '@clerk/nextjs/server';
import { db, chats, messages } from '@/lib/db';
import { eq, and, asc } from 'drizzle-orm';
import { NextRequest } from 'next/server';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Await the params Promise
        const { id: chatId } = await params;

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
            .where(and(eq(chats.id, chatId), eq(chats.userId, userId)))
            .limit(1);

        if (chat.length === 0) {
            return new Response(JSON.stringify({ error: 'Chat not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get messages for this chat, ordered by creation time
        const chatMessages = await db
            .select({
                id: messages.id,
                role: messages.role,
                content: messages.content,
                createdAt: messages.createdAt,
            })
            .from(messages)
            .where(eq(messages.chatId, chatId))
            .orderBy(asc(messages.createdAt));

        return Response.json(chatMessages);
    } catch (error) {
        console.error('Get messages error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}