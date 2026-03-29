/**
 * Server entry point.
 * ─ Load config
 * ─ Register global middleware
 * ─ Mount API router
 * ─ Export Bun server
 */
import { Hono } from 'hono'

import { env } from './config/env'
import { createCorsMiddleware, errorHandler, requestLogger } from './middleware/index'
import { apiRouter } from './routes/index'

const app = new Hono()

// ── Global middleware (order matters) ────────────────────────────
app.use('*', requestLogger())
app.use('*', createCorsMiddleware())
app.use('*', errorHandler)

// ── API routes ────────────────────────────────────────────────────
app.route('/api/v1', apiRouter)

// ── Root ──────────────────────────────────────────────────────────
app.get('/', (c) => c.json({ name: 'langchain-learn-api', version: '0.1.0' }))

console.warn(`[Server] Listening on http://localhost:${env.PORT}`)

export default {
  host: '0.0.0.0',
  port: env.PORT,
  fetch: app.fetch,
}
