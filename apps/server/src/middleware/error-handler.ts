import type { Context, Next } from 'hono'

import type { ApiError } from '@lcl/types'

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

    const apiError: ApiError = {
      code: 'INTERNAL_SERVER_ERROR',
      message: err instanceof Error ? err.message : 'An unexpected error occurred',
    }

    return c.json({ status: 'error', error: apiError }, 500)
  }
}
