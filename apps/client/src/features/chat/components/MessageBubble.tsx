/**
 * MessageBubble — renders a single chat message.
 * Pure display component; no local state.
 */
import type { ChatMessage } from '@lcl/shared/types'

interface MessageBubbleProps {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
      role="listitem"
      aria-label={`${message.role} message`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[var(--md-primary)] flex items-center justify-center mr-2 flex-shrink-0 mt-1">
          <span className="text-white text-xs font-bold">AI</span>
        </div>
      )}
      <div
        className={`
          max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
          ${
            isUser
              ? 'bg-[var(--md-primary)] text-white rounded-tr-sm'
              : 'bg-[var(--md-surface-container)] text-[var(--md-on-surface)] rounded-tl-sm'
          }
        `}
      >
        <p className="m-0 whitespace-pre-wrap">{message.content}</p>
        <time className="text-xs opacity-60 mt-1 block text-right" dateTime={message.createdAt}>
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </time>
      </div>
    </div>
  )
}
