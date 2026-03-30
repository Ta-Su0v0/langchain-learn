import { expect, test } from 'vitest'
import { createErrorResponse, createSuccessResponse, generateId } from '../src/index'

test('generateId', () => {
  expect(generateId()).toBeTruthy()
})

test('createSuccessResponse', () => {
  expect(createSuccessResponse({ ok: true })).toEqual({
    status: 'success',
    data: { ok: true },
  })
})

test('createErrorResponse', () => {
  expect(
    createErrorResponse({
      code: 'BAD_REQUEST',
      message: 'Invalid request',
    }),
  ).toEqual({
    status: 'error',
    error: {
      code: 'BAD_REQUEST',
      message: 'Invalid request',
    },
  })
})
