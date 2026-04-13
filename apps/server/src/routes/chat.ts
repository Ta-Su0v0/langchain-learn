/**
 * Chat route handler.
 * Responsibility: HTTP parsing & response only. Business logic lives in ChatService.
 */
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'

import {
  ApiCode,
  sendMessageRequestSchema,
  sessionIdParamSchema,
  type ChatSession,
  type SendMessageResponse,
} from '@lcl/shared/types'
import { createErrorResponse, createSuccessResponse } from '@lcl/shared/utils'

import { sendMessage, getSession } from '../services/chat.service.js'

export const chatRouter = new Hono()

const validationHook: Parameters<typeof zValidator>[2] = (result, c) => {
  if (result.success) {
    return
  }

  const issue = result.error.issues[0]

  return c.json(
    createErrorResponse(ApiCode.ValidationError, issue?.message ?? 'Request validation failed'),
    400,
  )
}

/**
 * POST /api/v1/chat
 * Send a message and receive an assistant response.
 */
chatRouter.post(
  '/',
  zValidator('json', sendMessageRequestSchema, validationHook),
  async (c): Promise<Response> => {
    const body = c.req.valid('json')
    const result = await sendMessage(body)
    const response = createSuccessResponse<SendMessageResponse>(result)
    return c.json(response, 201)
  },
)

/**
 * GET /api/v1/chat/:sessionId
 * Retrieve a full chat session history.
 */
chatRouter.get(
  '/:sessionId',
  zValidator('param', sessionIdParamSchema, validationHook),
  async (c): Promise<Response> => {
    const { sessionId } = c.req.valid('param')
    const session = await getSession(sessionId)

    if (session === undefined) {
      return c.json(createErrorResponse(ApiCode.SessionNotFound, 'Session not found'), 404)
    }

    return c.json(createSuccessResponse<ChatSession>(session))
  },
)
