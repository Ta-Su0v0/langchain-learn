import { describe, expect, it } from 'vitest'

import { filterDataset, parseStringToLisp, parseTokensToLisp } from '../../src/query-filter'
import type { DataItem, FilterLispExpression, FilterRule } from '../../src/query-filter'

interface PersonRecord extends DataItem {
  age?: number | string | null
  city?: string | null
  danger?: string
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
  {
    id: 'JOINED_BEFORE_2026',
    field: 'joinedAt',
    operator: 'lt',
    value: '2026-01-01T00:00:00.000Z',
  },
  { id: 'CITY_SHANGHAI', field: 'city', operator: 'eq', value: 'Shanghai' },
  { id: 'EMPTY_NOTE', field: 'notes', operator: 'eq', value: '' },
  { id: 'NULL_METADATA', field: 'metadata', operator: 'eq', value: null },
]

const people: PersonRecord[] = [
  {
    id: 1,
    name: 'Alice Wonderland',
    status: 'active',
    age: 28,
    city: 'Shanghai',
    joinedAt: '2025-06-01T00:00:00.000Z',
    notes: '',
    metadata: null,
  },
  {
    id: 2,
    name: 'Bobby',
    status: 'inactive',
    age: 17,
    city: 'Beijing',
    joinedAt: new Date('2026-02-01T00:00:00.000Z'),
    notes: null,
    metadata: undefined,
  },
  {
    id: 3,
    name: null,
    status: 'active',
    age: '21',
    city: 'Shenzhen',
    joinedAt: 'not-a-date',
    notes: 'memo',
    metadata: { tag: 'x' },
  },
  {
    id: 4,
    name: 'carol',
    status: 'active',
    age: 30,
    city: 'Hangzhou',
    joinedAt: null,
    notes: '',
    metadata: null,
  },
]

function collectIds(items: PersonRecord[]): number[] {
  return items.map((item) => item.id)
}

describe('query filter evaluator', () => {
  it('supports exact match rules and nullish boundaries', () => {
    expect(collectIds(filterDataset(people, baseRules, 'ACTIVE'))).toEqual([1, 3, 4])
    expect(collectIds(filterDataset(people, baseRules, 'EMPTY_NOTE'))).toEqual([1, 4])
    expect(collectIds(filterDataset(people, baseRules, 'NULL_METADATA'))).toEqual([1, 4])
  })

  it('supports case-insensitive contains and safe failure for empty or non-string values', () => {
    expect(collectIds(filterDataset(people, baseRules, 'NAME_ALI'))).toEqual([1])

    const emptyQueryRules: FilterRule[] = [
      { id: 'EMPTY_QUERY', field: 'name', operator: 'contains', value: '' },
    ]

    expect(collectIds(filterDataset(people, emptyQueryRules, 'EMPTY_QUERY'))).toEqual([])
  })

  it('supports numeric and ISO date range comparisons', () => {
    expect(collectIds(filterDataset(people, baseRules, 'AGE_GT_18'))).toEqual([1, 4])
    expect(collectIds(filterDataset(people, baseRules, 'JOINED_BEFORE_2026'))).toEqual([1])
  })

  it('evaluates nested LISP expressions with OR/AND precedence encoded by structure', () => {
    const expression: FilterLispExpression = [
      'and',
      ['or', 'CITY_SHANGHAI', 'NAME_ALI'],
      'AGE_GT_18',
    ]

    expect(collectIds(filterDataset(people, baseRules, expression))).toEqual([1])
  })

  it('short-circuits logical evaluation for nested expressions', () => {
    const guardedItem: PersonRecord = {
      id: 5,
      status: 'active',
      name: 'safe',
    }

    Object.defineProperty(guardedItem, 'danger', {
      configurable: true,
      enumerable: true,
      get() {
        throw new Error('Short-circuit failed')
      },
    })

    const rules: FilterRule[] = [
      { id: 'ACTIVE', field: 'status', operator: 'eq', value: 'active' },
      { id: 'DANGER', field: 'danger', operator: 'contains', value: 'boom' },
    ]

    expect(() => filterDataset([guardedItem], rules, ['or', 'ACTIVE', 'DANGER'])).not.toThrow()
    expect(collectIds(filterDataset([guardedItem], rules, ['or', 'ACTIVE', 'DANGER']))).toEqual([5])
  })
})

describe('query filter parser', () => {
  it('parses infix tokens into a LISP AST', () => {
    expect(
      parseTokensToLisp(
        ['(', 'CITY_SHANGHAI', 'OR', 'NAME_ALI', ')', 'AND', 'AGE_GT_18'],
        baseRules,
      ),
    ).toEqual(['and', ['or', 'CITY_SHANGHAI', 'NAME_ALI'], 'AGE_GT_18'])
  })

  it('parses infix strings into a LISP AST', () => {
    expect(parseStringToLisp('(CITY_SHANGHAI OR NAME_ALI) AND AGE_GT_18', baseRules)).toEqual([
      'and',
      ['or', 'CITY_SHANGHAI', 'NAME_ALI'],
      'AGE_GT_18',
    ])
  })

  it('rejects duplicate rules, unknown rule references, and unbalanced parentheses', () => {
    expect(() =>
      parseTokensToLisp(
        ['ACTIVE'],
        [
          { id: 'ACTIVE', field: 'status', operator: 'eq', value: 'active' },
          { id: 'ACTIVE', field: 'status', operator: 'eq', value: 'inactive' },
        ],
      ),
    ).toThrow(/Duplicate rule id/i)

    expect(() => parseStringToLisp('UNKNOWN AND ACTIVE', baseRules)).toThrow(
      /Unknown rule reference/i,
    )
    expect(() => parseStringToLisp('(ACTIVE OR NAME_ALI', baseRules)).toThrow(
      /Missing closing parenthesis/i,
    )
    expect(() =>
      filterDataset(people, baseRules, ['and', 'ACTIVE'] as unknown as FilterLispExpression),
    ).toThrow(/at least two operands/i)
  })
})
