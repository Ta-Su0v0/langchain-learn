import { expect, test } from 'bun:test'
import { generateId } from '../src/index'

test('generateId', () => {
  expect(generateId()).toBeTruthy()
})
