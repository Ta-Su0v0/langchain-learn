/**
 * Chat feature API service.
 * Wraps /api/v1/chat endpoints.
 */
import {
  createApiSuccessResponseSchema,
  sendMessageResponseSchema,
  type ApiSuccessResponse,
  type SendMessageResponse,
} from '@lcl/shared/types'

import { apiClient } from '@/services/api/client'

const sendMessageResponseEnvelopeSchema = createApiSuccessResponseSchema(sendMessageResponseSchema)

export async function sendChatMessage(
  content: string,
  sessionId?: string,
): Promise<ApiSuccessResponse<SendMessageResponse>> {
  return apiClient.post<SendMessageResponse>(
    '/chat',
    { content, sessionId },
    sendMessageResponseEnvelopeSchema,
  )
}
