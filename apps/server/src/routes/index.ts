/**
 * Root router — aggregates all sub-routers.
 * Add new feature routers here only; never add logic here.
 */
import { Hono } from 'hono'

import { chatRouter } from './chat.js'

export const apiRouter = new Hono()

apiRouter.route('/chat', chatRouter)

// Health check endpoint (required for all Google services)
apiRouter.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  })
})
