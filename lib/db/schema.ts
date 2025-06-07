import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';
import { sql } from 'drizzle-orm';

export const chats = sqliteTable('chats', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    userId: text('user_id').notNull(),
    title: text('title').default('New Chat'),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
    userIdIdx: index('chats_user_id_idx').on(table.userId),
    updatedAtIdx: index('chats_updated_at_idx').on(table.updatedAt),
}));

export const messages = sqliteTable('messages', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    chatId: text('chat_id').notNull().references(() => chats.id, { onDelete: 'cascade' }),
    role: text('role', { enum: ['user', 'assistant'] }).notNull(),
    content: text('content').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
    chatIdIdx: index('messages_chat_id_idx').on(table.chatId),
    createdAtIdx: index('messages_created_at_idx').on(table.createdAt),
}));

export type Chat = typeof chats.$inferSelect;
export type NewChat = typeof chats.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;