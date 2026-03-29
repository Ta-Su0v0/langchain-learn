/**
 * App root — composed header + main content area.
 * Layout-only component; no business logic.
 */
import { ChatWindow } from '@/features/chat/components/ChatWindow'

export function App() {
  return (
    <div className="flex flex-col h-full bg-[var(--md-surface)]">
      {/* ── App Header ─────────────────────────────────────── */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-[var(--md-outline-variant)] bg-[var(--md-surface)] shadow-sm flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-[var(--md-primary)] flex items-center justify-center">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
        <div>
          <h1 className="text-base font-semibold text-[var(--md-on-surface)] m-0 leading-tight">
            LangChain AI
          </h1>
          <p className="text-xs text-[var(--md-on-surface-variant)] m-0">
            Powered by LangChain & Google
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--md-secondary)] bg-[var(--md-primary-container)] px-2.5 py-1 rounded-full font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            在线
          </span>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────── */}
      <main className="flex-1 overflow-hidden max-w-4xl w-full mx-auto flex flex-col">
        <ChatWindow />
      </main>
    </div>
  )
}
