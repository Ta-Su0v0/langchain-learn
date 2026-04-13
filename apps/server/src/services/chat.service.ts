/**
 * Chat service — business logic layer.
 * Decoupled from HTTP transport; can be tested independently.
 *
 * TDD NOTE: See __tests__/chat.service.test.ts for test coverage.
 */
import type {
  ChatMessage,
  ChatSession,
  SendMessageRequest,
  SendMessageResponse,
} from '@lcl/shared/types'
import { generateId } from '@lcl/shared/utils'
import { asc, eq } from 'drizzle-orm'

import { db } from '../db/index.js'
import { chatMessages, chatSessions } from '../db/schema.js'

function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}

/**
 * Sends a message and returns the assistant's response.
 * Currently returns a mock response; integrate LangChain here.
 */
export async function sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
  const sessionId = request.sessionId ?? generateId()
  const now = new Date()
  const createdAt = now.toISOString()
  const session = await db
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.id, sessionId))
    .limit(1)

  const userMessage: ChatMessage = {
    id: generateId(),
    role: 'user',
    content: request.content,
    createdAt,
  }

  // TODO: Replace with LangChain call
  const assistantMessage: ChatMessage = {
    id: generateId(),
    role: 'assistant',
    content: `[LangChain stub] You said: "${request.content}"`,
    createdAt,
  }

  await db.transaction(async (tx) => {
    if (session.length === 0) {
      await tx.insert(chatSessions).values({
        id: sessionId,
        createdAt: now,
        updatedAt: now,
      })
    } else {
      await tx.update(chatSessions).set({ updatedAt: now }).where(eq(chatSessions.id, sessionId))
    }

    await tx.insert(chatMessages).values([
      {
        id: userMessage.id,
        sessionId,
        role: userMessage.role,
        content: userMessage.content,
        createdAt: now,
      },
      {
        id: assistantMessage.id,
        sessionId,
        role: assistantMessage.role,
        content: assistantMessage.content,
        createdAt: now,
      },
    ])
  })

  return { sessionId, message: assistantMessage }
}

/**
 * Retrieves a chat session by ID.
 */
export async function getSession(sessionId: string): Promise<ChatSession | undefined> {
  const session = await db
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.id, sessionId))
    .limit(1)

  if (session.length === 0) {
    return undefined
  }

  const sessionRow = session[0]

  if (!sessionRow) {
    return undefined
  }

  const messages = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(asc(chatMessages.createdAt))

  return {
    id: sessionRow.id,
    createdAt: toIso(sessionRow.createdAt),
    updatedAt: toIso(sessionRow.updatedAt),
    messages: messages.map((message) => ({
      id: message.id,
      role: message.role as ChatMessage['role'],
      content: message.content,
      createdAt: toIso(message.createdAt),
    })),
  }
}
