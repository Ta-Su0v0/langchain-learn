import * as z from 'zod'

export const MAX_MESSAGE_LENGTH = 2000

export const sessionIdSchema = z.string().uuid()
export const isoDateTimeStringSchema = z.string().datetime({ offset: true })

export const chatRoleSchema = z.enum(['user', 'assistant', 'system'])

export const chatMessageSchema = z.object({
  id: sessionIdSchema,
  role: chatRoleSchema,
  content: z.string(),
  createdAt: isoDateTimeStringSchema,
})

export const chatSessionSchema = z.object({
  id: sessionIdSchema,
  messages: z.array(chatMessageSchema),
  createdAt: isoDateTimeStringSchema,
  updatedAt: isoDateTimeStringSchema,
})

export const sendMessageRequestSchema = z.object({
  sessionId: sessionIdSchema.optional(),
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(MAX_MESSAGE_LENGTH, `Message too long (max ${MAX_MESSAGE_LENGTH} chars)`),
})

export const sendMessageResponseSchema = z.object({
  sessionId: sessionIdSchema,
  message: chatMessageSchema,
})

export const sessionIdParamSchema = z.object({
  sessionId: sessionIdSchema,
})

export type ChatRole = z.infer<typeof chatRoleSchema>
export type ChatMessage = z.infer<typeof chatMessageSchema>
export type ChatSession = z.infer<typeof chatSessionSchema>
export type SendMessageRequest = z.infer<typeof sendMessageRequestSchema>
export type SendMessageResponse = z.infer<typeof sendMessageResponseSchema>
export type SessionIdParams = z.infer<typeof sessionIdParamSchema>
