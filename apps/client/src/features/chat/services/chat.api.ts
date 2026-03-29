/**
 * Chat feature API service.
 * Wraps /api/v1/chat endpoints.
 */
import type { ApiResponse, SendMessageResponse } from '@lcl/types'

import { apiClient } from '@/services/api/client'

export async function sendChatMessage(
  content: string,
  sessionId?: string,
): Promise<ApiResponse<SendMessageResponse>> {
  return apiClient.post<SendMessageResponse>('/chat', { content, sessionId })
}
