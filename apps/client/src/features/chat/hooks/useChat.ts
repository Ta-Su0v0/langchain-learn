/**
 * useChat — custom hook for chat state management.
 *
 * TDD: See __tests__/useChat.test.ts for test coverage.
 * Pattern: Single hook owns all chat state, components are pure display.
 */
import { useState, useCallback } from 'react'

import type { ChatState } from '../types'
import { sendChatMessage } from '../services/chat.api'

export function useChat(): ChatState & {
  sendMessage: (content: string) => Promise<void>
  clearError: () => void
} {
  const [state, setState] = useState<ChatState>({
    sessionId: null,
    messages: [],
    isLoading: false,
    error: null,
  })

  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const response = await sendChatMessage(content, state.sessionId ?? undefined)
        const { sessionId, message } = response.data

        setState((prev) => ({
          sessionId,
          messages: [...prev.messages, message],
          isLoading: false,
          error: null,
        }))
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        }))
      }
    },
    [state.sessionId],
  )

  const clearError = useCallback((): void => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  return { ...state, sendMessage, clearError }
}
