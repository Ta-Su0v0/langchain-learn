import { describe, expect, it } from 'vitest'

import {
  attachQueryFilterWorker,
  handleQueryFilterWorkerRequest,
} from '../../../src/utils/query-filter'
import type {
  DataItem,
  FilterRule,
  FilterWorkerRequest,
  FilterWorkerResponse,
} from '../../../src/utils/query-filter'

interface PersonRecord extends DataItem {
  age?: number | string | null
  city?: string | null
  id: number
  joinedAt?: Date | string | null
  metadata?: unknown
  name?: string | null
  notes?: string | null
  status?: string | null
}

const baseRules: FilterRule[] = [
  { id: 'ACTIVE', field: 'status', operator: 'eq', value: 'active' },
  { id: 'NAME_ALI', field: 'name', operator: 'contains', value: 'ALI' },
  { id: 'AGE_GT_18', field: 'age', operator: 'gt', value: 18 },
  { id: 'CITY_SHANGHAI', field: 'city', operator: 'eq', value: 'Shanghai' },
]

const people: PersonRecord[] = [
  { id: 1, name: 'Alice Wonderland', status: 'active', age: 28, city: 'Shanghai' },
  { id: 2, name: 'Bobby', status: 'inactive', age: 17, city: 'Beijing' },
  { id: 3, name: 'carol', status: 'active', age: 30, city: 'Hangzhou' },
]

function createMockWorkerHost() {
  const messages: FilterWorkerResponse<PersonRecord>[] = []
  let listener: ((event: { data: FilterWorkerRequest<PersonRecord> }) => void) | undefined

  return {
    host: {
      addEventListener(
        type: 'message',
        nextListener: (event: { data: FilterWorkerRequest<PersonRecord> }) => void,
      ) {
        if (type === 'message') {
          listener = nextListener
        }
      },
      postMessage(message: FilterWorkerResponse<PersonRecord>) {
        messages.push(message)
      },
    },
    dispatch(payload: FilterWorkerRequest<PersonRecord>) {
      if (!listener) {
        throw new Error('Worker listener is not attached')
      }

      listener({ data: payload })
    },
    messages,
  }
}

describe('query filter worker', () => {
  it('returns successful responses from direct request handling', () => {
    const response = handleQueryFilterWorkerRequest<PersonRecord>({
      requestId: 'req-direct',
      data: people,
      rules: baseRules,
      expression: ['and', 'ACTIVE', 'AGE_GT_18'],
    })

    expect(response).toEqual({
      ok: true,
      requestId: 'req-direct',
      items: [people[0], people[2]],
    })
  })

  it('bridges request and response messages through the worker host', () => {
    const mockWorker = createMockWorkerHost()

    attachQueryFilterWorker(mockWorker.host)
    mockWorker.dispatch({
      requestId: 'req-success',
      data: people,
      rules: baseRules,
      expression: ['and', ['or', 'CITY_SHANGHAI', 'NAME_ALI'], 'AGE_GT_18'],
    })

    expect(mockWorker.messages).toEqual([
      {
        ok: true,
        requestId: 'req-success',
        items: [people[0]],
      },
    ])
  })

  it('serializes worker errors without swallowing the request id', () => {
    const mockWorker = createMockWorkerHost()

    attachQueryFilterWorker(mockWorker.host)
    mockWorker.dispatch({
      requestId: 'req-error',
      data: people,
      rules: baseRules,
      expression: ['and', 'ACTIVE', 'UNKNOWN'],
    })

    expect(mockWorker.messages).toHaveLength(1)
    expect(mockWorker.messages[0]).toMatchObject({
      ok: false,
      requestId: 'req-error',
    })
    expect('message' in mockWorker.messages[0] ? mockWorker.messages[0].message : '').toMatch(
      /Unknown rule reference/i,
    )
  })
})
