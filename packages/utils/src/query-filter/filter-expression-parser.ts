import type {
  FilterExpressionInput,
  FilterLispExpression,
  FilterLogicalOperator,
  FilterRule,
  FilterToken,
} from './filter-contract'

interface TokenCursor {
  index: number
  tokens: string[]
}

const INFIX_OPERATORS = new Set(['AND', 'OR'])
const LISP_OPERATORS = new Set<FilterLogicalOperator>(['and', 'or'])

export function createFilterRuleIdSet(rules: readonly FilterRule[]): Set<string> {
  const ruleIds = new Set<string>()

  for (const rule of rules) {
    if (rule.id.length === 0) {
      throw new Error('Rule id cannot be empty')
    }

    const reservedId = rule.id.toLowerCase()
    if (LISP_OPERATORS.has(reservedId as FilterLogicalOperator)) {
      throw new Error(`Rule id "${rule.id}" is reserved for logical operators`)
    }

    if (ruleIds.has(rule.id)) {
      throw new Error(`Duplicate rule id: ${rule.id}`)
    }

    ruleIds.add(rule.id)
  }

  return ruleIds
}

export function parseTokensToLisp(
  tokens: readonly FilterToken[],
  rules: readonly FilterRule[],
): FilterLispExpression {
  const ruleIds = createFilterRuleIdSet(rules)
  const normalizedTokens = tokens.map(normalizeToken).filter((token) => token.length > 0)

  if (normalizedTokens.length === 0) {
    throw new Error('Filter expression cannot be empty')
  }

  const cursor: TokenCursor = {
    index: 0,
    tokens: normalizedTokens,
  }
  const expression = parseOrExpression(cursor, ruleIds)

  if (cursor.index < cursor.tokens.length) {
    throw new Error(`Unexpected token "${cursor.tokens[cursor.index]}"`)
  }

  return expression
}

export function parseStringToLisp(
  expression: string,
  rules: readonly FilterRule[],
): FilterLispExpression {
  return parseTokensToLisp(tokenizeExpression(expression), rules)
}

export function validateLispExpression(
  expression: FilterLispExpression,
  ruleIds: Set<string>,
): void {
  if (typeof expression === 'string') {
    ensureKnownRule(expression, ruleIds)
    return
  }

  const [operator, ...operands] = expression

  if (!LISP_OPERATORS.has(operator)) {
    throw new Error(`Unsupported LISP operator: ${String(operator)}`)
  }

  if (operands.length < 2) {
    throw new Error(`Logical operator "${operator}" must contain at least two operands`)
  }

  for (const operand of operands) {
    validateLispExpression(operand, ruleIds)
  }
}

export function normalizeFilterExpression(
  expression: FilterExpressionInput | undefined,
  rules: readonly FilterRule[],
): FilterLispExpression {
  if (rules.length === 0) {
    throw new Error('Cannot build an expression without filter rules')
  }

  if (expression === undefined) {
    return createDefaultExpression(rules)
  }

  if (typeof expression === 'string') {
    return parseStringToLisp(expression, rules)
  }

  if (Array.isArray(expression)) {
    if (isLispExpression(expression)) {
      validateLispExpression(expression, createFilterRuleIdSet(rules))
      return expression
    }

    return parseTokensToLisp(expression, rules)
  }

  validateLispExpression(expression, createFilterRuleIdSet(rules))
  return expression
}

function createDefaultExpression(rules: readonly FilterRule[]): FilterLispExpression {
  if (rules.length === 1) {
    return rules[0]?.id ?? ''
  }

  return ['and', ...rules.map((rule) => rule.id)]
}

function parseOrExpression(cursor: TokenCursor, ruleIds: Set<string>): FilterLispExpression {
  const operands = [parseAndExpression(cursor, ruleIds)]

  while (matchToken(cursor, 'OR')) {
    operands.push(parseAndExpression(cursor, ruleIds))
  }

  return collapseOperands('or', operands)
}

function parseAndExpression(cursor: TokenCursor, ruleIds: Set<string>): FilterLispExpression {
  const operands = [parsePrimaryExpression(cursor, ruleIds)]

  while (matchToken(cursor, 'AND')) {
    operands.push(parsePrimaryExpression(cursor, ruleIds))
  }

  return collapseOperands('and', operands)
}

function parsePrimaryExpression(cursor: TokenCursor, ruleIds: Set<string>): FilterLispExpression {
  const token = cursor.tokens[cursor.index]

  if (!token) {
    throw new Error('Unexpected end of filter expression')
  }

  if (token === '(') {
    cursor.index += 1
    const nestedExpression = parseOrExpression(cursor, ruleIds)

    if (cursor.tokens[cursor.index] !== ')') {
      throw new Error('Missing closing parenthesis in filter expression')
    }

    cursor.index += 1
    return nestedExpression
  }

  if (token === ')' || INFIX_OPERATORS.has(token)) {
    throw new Error(`Unexpected token "${token}"`)
  }

  ensureKnownRule(token, ruleIds)
  cursor.index += 1

  return token
}

function collapseOperands(
  operator: FilterLogicalOperator,
  operands: FilterLispExpression[],
): FilterLispExpression {
  if (operands.length === 1) {
    return operands[0] ?? ''
  }

  return [operator, operands[0], operands[1], ...operands.slice(2)]
}

function matchToken(cursor: TokenCursor, expected: string): boolean {
  if (cursor.tokens[cursor.index] !== expected) {
    return false
  }

  cursor.index += 1
  return true
}

function ensureKnownRule(ruleId: string, ruleIds: Set<string>): void {
  if (!ruleIds.has(ruleId)) {
    throw new Error(`Unknown rule reference: ${ruleId}`)
  }
}

function tokenizeExpression(expression: string): string[] {
  const tokens = expression.match(/\(|\)|\bAND\b|\bOR\b|[^\s()]+/gi)

  if (!tokens) {
    return []
  }

  return tokens
}

function normalizeToken(token: FilterToken): string {
  const trimmed = token.trim()

  if (trimmed === '(' || trimmed === ')') {
    return trimmed
  }

  const upperCased = trimmed.toUpperCase()
  if (INFIX_OPERATORS.has(upperCased)) {
    return upperCased
  }

  return trimmed
}

function isLispExpression(expression: FilterExpressionInput): expression is FilterLispExpression {
  return (
    Array.isArray(expression) &&
    typeof expression[0] === 'string' &&
    LISP_OPERATORS.has(expression[0] as FilterLogicalOperator)
  )
}
