import type { DataItem, FilterRule } from './filter-contract'
import { filterDataset } from './filter-expression-evaluator'
import { createQueryFilterWorkerClient } from './filter-worker-client'

export interface QueryFilterExampleRecord extends DataItem {
  age: number
  id: number
  name: string
  status: 'active' | 'inactive'
}

export const queryFilterExampleRules: FilterRule[] = [
  { id: 'ACTIVE', field: 'status', operator: 'eq', value: 'active' },
  { id: 'NAME_ALI', field: 'name', operator: 'contains', value: 'ali' },
  { id: 'AGE_GT_20', field: 'age', operator: 'gt', value: 20 },
]

export const queryFilterExampleData: QueryFilterExampleRecord[] = [
  { id: 1, name: 'Alice', status: 'active', age: 29 },
  { id: 2, name: 'Bob', status: 'inactive', age: 18 },
  { id: 3, name: 'Alina', status: 'active', age: 24 },
]

export const queryFilterExampleExpression = '(ACTIVE OR NAME_ALI) AND AGE_GT_20'

export function runQueryFilterExample(): QueryFilterExampleRecord[] {
  return filterDataset(
    queryFilterExampleData,
    queryFilterExampleRules,
    queryFilterExampleExpression,
  )
}

export function createQueryFilterExampleClient() {
  return createQueryFilterWorkerClient<QueryFilterExampleRecord>()
}
