import { expect, test } from 'vitest'

import { generateId } from '../../src/utils/id'

test('subpath modules expose the expected entrypoints', () => {
  expect(typeof generateId).toBe('function')
})
