import { cors } from 'hono/cors'
/**
 * CORS middleware configured from env.CLIENT_ORIGIN.
 */
export function createCorsMiddleware() {
  return cors({
    origin: '',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
}
