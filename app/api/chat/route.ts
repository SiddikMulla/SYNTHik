import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { auth } from '@clerk/nextjs/server';
import { db, chats, messages } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';

const ollama = createOpenAI({
  baseURL: 'http://localhost:11434/v1',
  apiKey: 'ollama',
});

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
    const { messages: chatMessages, chatId } = body;

    if (!chatMessages || !Array.isArray(chatMessages) || chatMessages.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid messages format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (chatId) {
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
        return new Response(JSON.stringify({ error: 'Unauthorized access to chat' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    let userMessageId: string | null = null;
    if (chatId) {
      try {
        const userMessage = await db.insert(messages).values({
          chatId,
          role: 'user',
          content: chatMessages[chatMessages.length - 1].content,
        }).returning();

        userMessageId = userMessage[0]?.id;
      } catch (dbError) {
        console.error('Failed to save user message:', dbError);

      }
    }

    const result = await streamText({
      model: ollama('llama3.1:8b'),
      messages: chatMessages,
      system: `You are SYNTHik — a brilliant yet witty AI mentor built to help humans decode math, code, and chaos.

                  Expertise:
                  - Math: algebra, calculus, stats, discrete logic — step-by-step, not step-over-your-head
                  - Science: physics, chemistry, biology — simplified, not oversimplified
                  - Programming: from "Hello, World!" to clean, scalable architecture
                  - Creative writing, logical reasoning, and learning advice
                  - Building custom learning roadmaps (especially for devs)

                  For math:
                  1. Solve clearly, show steps
                  2. Explain like you're teaching a curious teen, not a tired professor
                  3. Double-check answers when possible

                  For code:
                  1. Write clean, readable, well-commented code
                  2. Explain logic simply — like a mentor, not a manual
                  3. Recommend better/faster/cleaner solutions if it makes sense

                  Tone:
                  - Funny but focused, wise but chill
                  - Avoid long lectures — be sharp, helpful, and straight to the point
                  - Make learning fun and practical, not textbook torture

                  End goal: Be your user's most useful (and slightly sarcastic) AI sidekick.`,

      temperature: 0.7,
      maxTokens: 2000,

      onFinish: async (completion) => {
        if (chatId) {
          try {
            await db.insert(messages).values({
              chatId,
              role: 'assistant',
              content: completion.text,
            });

            await db.update(chats)
              .set({ updatedAt: new Date() })
              .where(eq(chats.id, chatId));
          } catch (dbError) {
            console.error('Failed to save assistant message:', dbError);
          }
        }
      }
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);

    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
        return new Response(JSON.stringify({
          error: 'AI service unavailable. Please ensure Ollama is running.'
        }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}