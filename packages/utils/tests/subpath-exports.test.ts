import { expect, test } from 'vitest'

import { generateId } from '../src/id'
import { filterDataset } from '../src/query-filter'
import { createSuccessResponse } from '../src/response'

test('subpath modules expose the expected entrypoints', () => {
  expect(typeof generateId).toBe('function')
  expect(typeof filterDataset).toBe('function')
  expect(createSuccessResponse('ok')).toEqual({
    status: 'success',
    data: 'ok',
  })
})
