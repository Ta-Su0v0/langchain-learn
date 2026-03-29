/**
 * Chat route handler.
 * Responsibility: HTTP parsing & response only. Business logic lives in ChatService.
 */
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

import type { ApiResponse, SendMessageResponse } from '@lcl/types'
import { MAX_MESSAGE_LENGTH } from '@lcl/types'
import { createErrorResponse, createSuccessResponse } from '@lcl/utils'

import { sendMessage, getSession } from '../services/chat.service.js'

export const chatRouter = new Hono()

const sendMessageSchema = z.object({
  sessionId: z.string().uuid().optional(),
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(MAX_MESSAGE_LENGTH, `Message too long (max ${MAX_MESSAGE_LENGTH} chars)`),
})

/**
 * POST /api/v1/chat
 * Send a message and receive an assistant response.
 */
chatRouter.post('/', zValidator('json', sendMessageSchema), async (c): Promise<Response> => {
  const body = c.req.valid('json')
  const result = await sendMessage(body)
  const response: ApiResponse<SendMessageResponse> = createSuccessResponse(result)
  return c.json(response, 201)
})

/**
 * GET /api/v1/chat/:sessionId
 * Retrieve a full chat session history.
 */
chatRouter.get('/:sessionId', async (c): Promise<Response> => {
  const { sessionId } = c.req.param()
  const session = await getSession(sessionId)
  if (session === undefined) {
    return c.json(
      createErrorResponse({
        code: 'SESSION_NOT_FOUND',
        message: 'Session not found',
      }),
      404,
    )
  }
  return c.json(createSuccessResponse(session))
})
