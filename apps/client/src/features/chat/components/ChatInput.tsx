/**
 * ChatInput — message composition bar.
 * Controlled input; submit on Enter (Shift+Enter = newline).
 */
import { useState, useRef, type KeyboardEvent } from 'react'

import { MAX_MESSAGE_LENGTH } from '@lcl/shared/types'

interface ChatInputProps {
  onSend: (content: string) => void
  isLoading: boolean
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (): void => {
    const trimmed = value.trim()
    if (trimmed === '' || isLoading) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current !== null) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInput = (): void => {
    const el = textareaRef.current
    if (el === null) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  const charCount = value.length
  const isOverLimit = charCount > MAX_MESSAGE_LENGTH

  return (
    <div className="border-t border-[var(--md-outline-variant)] bg-[var(--md-surface)] p-4">
      <div className="max-w-3xl mx-auto flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            id="chat-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="输入消息… (Enter 发送, Shift+Enter 换行)"
            rows={1}
            maxLength={MAX_MESSAGE_LENGTH + 10}
            disabled={isLoading}
            aria-label="Chat message input"
            className={`
              w-full resize-none rounded-2xl px-4 py-3 pr-12 text-sm
              bg-[var(--md-surface-container-high)] text-[var(--md-on-surface)]
              border border-[var(--md-outline-variant)] outline-none
              transition-all duration-200
              focus:border-[var(--md-primary)] focus:ring-2 focus:ring-[var(--md-primary)]/20
              disabled:opacity-50 disabled:cursor-not-allowed
              min-h-[48px] max-h-[160px] overflow-y-auto
            `}
          />
          <span
            className={`
              absolute bottom-2.5 right-3 text-xs tabular-nums
              ${isOverLimit ? 'text-red-500' : 'text-[var(--md-on-surface-variant)]'}
            `}
          >
            {charCount}/{MAX_MESSAGE_LENGTH}
          </span>
        </div>
        <button
          id="chat-send-btn"
          onClick={handleSubmit}
          disabled={isLoading || value.trim() === '' || isOverLimit}
          aria-label="Send message"
          className={`
            w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
            bg-[var(--md-primary)] text-white
            transition-all duration-200 shadow-md
            hover:shadow-lg hover:brightness-110
            disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
            active:scale-95
          `}
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
