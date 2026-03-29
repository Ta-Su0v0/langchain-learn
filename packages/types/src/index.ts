export type ApiStatus = 'success' | 'error'

export interface ApiError {
  code: string
  message: string
}

export interface ApiResponse<T> {
  status: ApiStatus
  data: T
}

export interface ApiErrorResponse {
  status: 'error'
  error: ApiError
}

export const MAX_MESSAGE_LENGTH = 2000

export type ChatRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  createdAt: string
}

export interface ChatSession {
  id: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

export interface SendMessageRequest {
  sessionId?: string
  content: string
}

export interface SendMessageResponse {
  sessionId: string
  message: ChatMessage
}
