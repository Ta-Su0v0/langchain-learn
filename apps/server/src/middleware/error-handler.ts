import type { Context, Next } from 'hono'

import { ApiCode } from '@lcl/shared/types'
import { createErrorResponse } from '@lcl/shared/utils'

/**
 * Global error handler middleware.
 * Catches all unhandled errors and returns a standardised JSON error envelope.
 */
export async function errorHandler(c: Context, next: Next): Promise<Response> {
  try {
    await next()
    return c.res
  } catch (err) {
    console.error('[ErrorHandler]', err)

    const message = err instanceof Error ? err.message : 'An unexpected error occurred'

    return c.json(createErrorResponse(ApiCode.InternalServerError, message), 500)
  }
}
