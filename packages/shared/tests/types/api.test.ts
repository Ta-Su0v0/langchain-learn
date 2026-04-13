import { describe, expect, it } from 'vitest'
import * as z from 'zod'

import {
  ApiCode,
  apiErrorResponseSchema,
  createApiResponseSchema,
  createApiSuccessResponseSchema,
} from '../../src/types'

describe('api shared contract', () => {
  it('builds success response schemas with numeric success codes', () => {
    const schema = createApiSuccessResponseSchema(
      z.object({
        ok: z.boolean(),
      }),
    )

    expect(
      schema.parse({
        code: ApiCode.Success,
        message: 'OK',
        data: { ok: true },
      }),
    ).toEqual({
      code: ApiCode.Success,
      message: 'OK',
      data: { ok: true },
    })
  })

  it('validates error responses with numeric business codes', () => {
    expect(
      apiErrorResponseSchema.parse({
        code: ApiCode.SessionNotFound,
        message: 'Session not found',
        data: null,
      }),
    ).toEqual({
      code: ApiCode.SessionNotFound,
      message: 'Session not found',
      data: null,
    })
  })

  it('accepts both success and error envelopes through the union schema', () => {
    const schema = createApiResponseSchema(
      z.object({
        id: z.string(),
      }),
    )

    expect(
      schema.parse({
        code: ApiCode.Success,
        message: 'OK',
        data: { id: 'abc' },
      }),
    ).toEqual({
      code: ApiCode.Success,
      message: 'OK',
      data: { id: 'abc' },
    })

    expect(
      schema.parse({
        code: ApiCode.ValidationError,
        message: 'Invalid request',
        data: null,
      }),
    ).toEqual({
      code: ApiCode.ValidationError,
      message: 'Invalid request',
      data: null,
    })
  })
})
