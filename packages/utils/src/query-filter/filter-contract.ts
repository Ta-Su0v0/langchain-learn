export type DataItem = Record<string, unknown>

export type FilterOperator = 'eq' | 'contains' | 'gt' | 'lt'

export interface FilterRule {
  id: string
  field: string
  operator: FilterOperator
  value: string | number | boolean | Date | null
}

export type FilterRuleRef = string

export type FilterLogicalOperator = 'and' | 'or'

export type FilterLispExpression =
  | FilterRuleRef
  | [FilterLogicalOperator, FilterLispExpression, FilterLispExpression, ...FilterLispExpression[]]

export type FilterToken = '(' | ')' | 'AND' | 'OR' | string

export type FilterExpressionInput = FilterLispExpression | FilterToken[] | string

export interface FilterWorkerRequest<T extends DataItem = DataItem> {
  requestId: string
  data: T[]
  rules: FilterRule[]
  expression?: FilterExpressionInput
}

export interface FilterWorkerSuccessResponse<T extends DataItem = DataItem> {
  ok: true
  requestId: string
  items: T[]
}

export interface FilterWorkerErrorResponse {
  ok: false
  requestId: string
  message: string
}

export type FilterWorkerResponse<T extends DataItem = DataItem> =
  | FilterWorkerSuccessResponse<T>
  | FilterWorkerErrorResponse

export interface FilterWorkerMessageEvent<T extends DataItem = DataItem> {
  data: FilterWorkerRequest<T>
}

export interface FilterWorkerHost<T extends DataItem = DataItem> {
  addEventListener(type: 'message', listener: (event: FilterWorkerMessageEvent<T>) => void): void
  postMessage(message: FilterWorkerResponse<T>, transfer?: Transferable[]): void
}
