import { cors } from 'hono/cors'

import { env } from '../config/env.js'

/**
 * CORS middleware configured from env.CLIENT_ORIGIN.
 */
export function createCorsMiddleware() {
  return cors({
    origin: '', //env.CLIENT_ORIGIN,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
}
