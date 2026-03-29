/**
 * ChatWindow — main chat feature container.
 * Composes MessageBubble + ChatInput, driven by useChat hook.
 */
import { useEffect, useRef } from 'react'

import { useChat } from '../hooks/useChat'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'

export function ChatWindow() {
  const { messages, isLoading, error, sendMessage, clearError } = useChat()
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      {/* Error banner */}
      {error !== null && (
        <div
          role="alert"
          className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-4 py-3 flex justify-between items-center text-sm text-red-700 dark:text-red-300"
        >
          <span>⚠ {error}</span>
          <button
            onClick={clearError}
            aria-label="Dismiss error"
            className="text-red-500 hover:text-red-700 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Messages list */}
      <main
        id="chat-messages"
        role="list"
        aria-label="Chat messages"
        aria-live="polite"
        className="flex-1 overflow-y-auto px-4 py-6 space-y-1"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-[var(--md-on-surface-variant)] select-none">
            <div className="w-20 h-20 rounded-full bg-[var(--md-primary-container)] flex items-center justify-center mb-4">
              <svg
                className="w-10 h-10 text-[var(--md-on-primary-container)]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-[var(--md-on-surface)] mb-2">开始对话</h2>
            <p className="text-sm text-center max-w-xs">
              由 LangChain 驱动的 AI 助手。输入您的问题或指令开始聊天。
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && (
          <div className="flex justify-start mb-3">
            <div className="w-8 h-8 rounded-full bg-[var(--md-primary)] flex items-center justify-center mr-2 flex-shrink-0 mt-1">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <div className="bg-[var(--md-surface-container)] rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                <span className="w-2 h-2 bg-[var(--md-primary)] rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-[var(--md-primary)] rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-[var(--md-primary)] rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      {/* Input bar */}
      <ChatInput onSend={sendMessage} isLoading={isLoading} />
    </div>
  )
}
