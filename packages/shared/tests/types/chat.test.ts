import { describe, expect, it } from 'vitest'

import {
  MAX_MESSAGE_LENGTH,
  sendMessageRequestSchema,
  sendMessageResponseSchema,
  sessionIdParamSchema,
  type SendMessageRequest,
} from '../../src/types'

describe('chat shared contract', () => {
  it('rejects empty content', () => {
    const result = sendMessageRequestSchema.safeParse({
      content: '',
    })

    expect(result.success).toBe(false)
  })

  it('rejects overlong content', () => {
    const result = sendMessageRequestSchema.safeParse({
      content: 'x'.repeat(MAX_MESSAGE_LENGTH + 1),
    })

    expect(result.success).toBe(false)
  })

  it('rejects invalid session ids', () => {
    const result = sessionIdParamSchema.safeParse({
      sessionId: 'invalid-id',
    })

    expect(result.success).toBe(false)
  })

  it('derives types from schemas without manual duplication', () => {
    const request: SendMessageRequest = {
      content: 'hello',
    }

    expect(request).toEqual({ content: 'hello' })
    expect(
      sendMessageResponseSchema.parse({
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        message: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          role: 'assistant',
          content: 'hi',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      }),
    ).toMatchObject({
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
    })
  })
})
