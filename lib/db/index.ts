import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { chats, messages } from './schema';
import path from 'path';

const sqlite = new Database(path.join(process.cwd(), 'database.db'));
export const db = drizzle(sqlite, { schema: { chats, messages } });

try {
    migrate(db, { migrationsFolder: './drizzle' });
} catch (error) {
    console.log('Migration error:', error);
}

export { chats, messages };