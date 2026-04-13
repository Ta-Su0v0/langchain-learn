import { expect, test } from 'vitest'

import { generateId } from '../../src/utils'

test('generateId returns a UUID value', () => {
  expect(generateId()).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  )
})
