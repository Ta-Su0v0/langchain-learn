import { expect, test } from 'vitest'

import { generateId } from '../../src/utils/id'
import { filterDataset } from '../../src/utils/query-filter'
import { createSuccessResponse } from '../../src/utils/response'

test('subpath modules expose the expected entrypoints', () => {
  expect(typeof generateId).toBe('function')
  expect(typeof filterDataset).toBe('function')
  expect(createSuccessResponse('ok')).toEqual({
    code: 0,
    message: 'OK',
    data: 'ok',
  })
})
