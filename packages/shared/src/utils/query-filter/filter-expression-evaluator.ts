import type { DataItem, FilterExpressionInput, FilterRule } from './filter-contract'
import { createFilterRuleIdSet, normalizeFilterExpression } from './filter-expression-parser'

interface ComparableValue {
  kind: 'date' | 'number'
  value: number
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}(?:[Tt ][^\s]+)?$/

export function filterDataset<T extends DataItem>(
  data: readonly T[],
  rules: readonly FilterRule[],
  expression?: FilterExpressionInput,
): T[] {
  if (rules.length === 0) {
    return [...data]
  }

  const predicates = compileRulePredicates<T>(rules)
  const normalizedExpression = normalizeFilterExpression(expression, rules)

  return data.filter((item) => evaluateExpression(normalizedExpression, predicates, item))
}

function compileRulePredicates<T extends DataItem>(
  rules: readonly FilterRule[],
): Map<string, (item: T) => boolean> {
  const ruleIds = createFilterRuleIdSet(rules)
  const predicates = new Map<string, (item: T) => boolean>()

  for (const rule of rules) {
    if (!ruleIds.has(rule.id)) {
      continue
    }

    predicates.set(rule.id, createPredicate(rule))
  }

  return predicates
}

function createPredicate<T extends DataItem>(rule: FilterRule): (item: T) => boolean {
  switch (rule.operator) {
    case 'eq':
      return (item) => item[rule.field] === rule.value
    case 'contains':
      return (item) => evaluateContains(item[rule.field], rule.value)
    case 'gt':
      return (item) => compareValues(item[rule.field], rule.value, 'gt')
    case 'lt':
      return (item) => compareValues(item[rule.field], rule.value, 'lt')
    default:
      return assertNever(rule.operator)
  }
}

function evaluateContains(candidate: unknown, expected: FilterRule['value']): boolean {
  if (typeof candidate !== 'string' || typeof expected !== 'string') {
    return false
  }

  if (expected.length === 0) {
    return false
  }

  return candidate.toLocaleLowerCase().includes(expected.toLocaleLowerCase())
}

function compareValues(left: unknown, right: FilterRule['value'], operator: 'gt' | 'lt'): boolean {
  const normalizedLeft = toComparableValue(left)
  const normalizedRight = toComparableValue(right)

  if (!normalizedLeft || !normalizedRight || normalizedLeft.kind !== normalizedRight.kind) {
    return false
  }

  return operator === 'gt'
    ? normalizedLeft.value > normalizedRight.value
    : normalizedLeft.value < normalizedRight.value
}

function toComparableValue(value: unknown): ComparableValue | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? { kind: 'number', value } : null
  }

  if (value instanceof Date) {
    const timestamp = value.getTime()
    return Number.isNaN(timestamp) ? null : { kind: 'date', value: timestamp }
  }

  if (typeof value === 'string' && ISO_DATE_PATTERN.test(value)) {
    const timestamp = Date.parse(value)
    return Number.isNaN(timestamp) ? null : { kind: 'date', value: timestamp }
  }

  return null
}

function evaluateExpression<T extends DataItem>(
  expression: ReturnType<typeof normalizeFilterExpression>,
  predicates: Map<string, (item: T) => boolean>,
  item: T,
): boolean {
  if (typeof expression === 'string') {
    const predicate = predicates.get(expression)

    if (!predicate) {
      throw new Error(`Unknown rule reference: ${expression}`)
    }

    return predicate(item)
  }

  const [operator, ...operands] = expression

  // Preserve LISP structure and short-circuit semantics during recursive evaluation.
  if (operator === 'and') {
    for (const operand of operands) {
      if (!evaluateExpression(operand, predicates, item)) {
        return false
      }
    }

    return true
  }

  for (const operand of operands) {
    if (evaluateExpression(operand, predicates, item)) {
      return true
    }
  }

  return false
}

function assertNever(value: never): never {
  throw new Error(`Unsupported operator: ${String(value)}`)
}
