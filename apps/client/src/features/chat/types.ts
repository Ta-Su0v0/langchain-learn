/**
 * Chat feature types.
 * Keep feature-local types here; shared types live in @lcl/shared/types.
 */
import type { ChatMessage, ChatSession } from '@lcl/shared/types'

export type { ChatMessage, ChatSession }

export interface ChatState {
  readonly sessionId: string | null
  readonly messages: readonly ChatMessage[]
  readonly isLoading: boolean
  readonly error: string | null
}
