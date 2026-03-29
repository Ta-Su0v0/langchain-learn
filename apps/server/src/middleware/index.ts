/**
 * Middleware barrel — registers all middleware on an app instance.
 */
export { createCorsMiddleware } from './cors.js'
export { errorHandler } from './error-handler.js'
export { requestLogger } from './logger.js'
