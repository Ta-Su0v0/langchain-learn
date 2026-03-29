import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const chatSessions = pgTable('chat_sessions', {
  id: uuid('id').primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().notNull(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => chatSessions.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
