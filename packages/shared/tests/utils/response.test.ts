import { expect, test } from 'vitest'

import { ApiCode } from '../../src/types'
import { createErrorResponse, createSuccessResponse } from '../../src/utils'

test('createSuccessResponse matches the shared success envelope', () => {
  expect(createSuccessResponse({ ok: true })).toEqual({
    code: ApiCode.Success,
    message: 'OK',
    data: { ok: true },
  })
})

test('createErrorResponse matches the shared error envelope', () => {
  expect(createErrorResponse(ApiCode.ValidationError, 'Invalid request')).toEqual({
    code: ApiCode.ValidationError,
    message: 'Invalid request',
    data: null,
  })
})
