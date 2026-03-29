import { logger } from 'hono/logger'

/**
 * Structured request logger.
 * Uses Hono's built-in logger in development; replace with Pino in production.
 */
export function requestLogger() {
  return logger((message: string, ...rest: string[]) => {
    console.warn(`[${new Date().toISOString()}] ${message}`, ...rest)
  })
}
