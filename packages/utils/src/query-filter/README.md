# Query Filter

`query-filter` 是 `@lcl/utils` 里的前端数据筛选模块，主入口方法是 `filterDataset`。

它支持：

- 多条件筛选
- `eq` / `contains` / `gt` / `lt`
- LISP AST 表达式
- 中缀 token 表达式
- 中缀字符串表达式
- Web Worker 子线程执行

## 主方法

```ts
filterDataset<T extends DataItem>(
  data: readonly T[],
  rules: readonly FilterRule[],
  expression?: FilterExpressionInput,
): T[]
```

### 参数

- `data`
  要筛选的数据集。
- `rules`
  筛选规则列表，每条规则必须有唯一的 `id`。
- `expression`
  可选的逻辑表达式。
  支持三种形式：
  - LISP AST
  - token 数组
  - 中缀字符串

### 返回值

返回满足条件的新数组，不会修改原始数据。

## 类型说明

```ts
type DataItem = Record<string, unknown>

type FilterOperator = 'eq' | 'contains' | 'gt' | 'lt'

interface FilterRule {
  id: string
  field: string
  operator: FilterOperator
  value: string | number | boolean | Date | null
}
```

## 表达式写法

### 1. LISP AST

内部唯一 AST 形态是 LISP 风格表达式：

```ts
['and', ['or', 'ACTIVE', 'NAME_ALI'], 'AGE_GT_20']
```

表示：

```text
(ACTIVE OR NAME_ALI) AND AGE_GT_20
```

### 2. Token 数组

```ts
['(', 'ACTIVE', 'OR', 'NAME_ALI', ')', 'AND', 'AGE_GT_20']
```

可以通过 `parseTokensToLisp` 转成 LISP AST。

### 3. 中缀字符串

```ts
'(ACTIVE OR NAME_ALI) AND AGE_GT_20'
```

可以通过 `parseStringToLisp` 转成 LISP AST。

## 使用示例

### 同步筛选

```ts
import { filterDataset } from '@lcl/utils'

const data = [
  { id: 1, name: 'Alice', status: 'active', age: 29 },
  { id: 2, name: 'Bob', status: 'inactive', age: 18 },
  { id: 3, name: 'Alina', status: 'active', age: 24 },
]

const rules = [
  { id: 'ACTIVE', field: 'status', operator: 'eq', value: 'active' },
  { id: 'NAME_ALI', field: 'name', operator: 'contains', value: 'ali' },
  { id: 'AGE_GT_20', field: 'age', operator: 'gt', value: 20 },
]

const result = filterDataset(data, rules, '(ACTIVE OR NAME_ALI) AND AGE_GT_20')
```

### Worker 调用

```ts
import { createQueryFilterWorkerClient } from '@lcl/utils/src/query-filter'

const client = createQueryFilterWorkerClient<{ id: number; name: string; status: string; age: number }>()

const result = await client.run(data, rules, '(ACTIVE OR NAME_ALI) AND AGE_GT_20')

client.terminate()
```

## 默认行为

- 没有规则时，返回原数据副本
- 只有一条规则时，默认直接使用该规则
- 多条规则但未传 `expression` 时，默认按 `and` 组合全部规则

## 边界处理

- `eq` 使用严格相等 `===`
- `contains` 大小写不敏感
- `contains` 遇到空查询值时返回 `false`
- `gt` / `lt` 支持数字、`Date`、ISO 日期字符串
- 不可比较值、无效日期、缺失字段统一返回 `false`
- 未知规则引用、重复规则 id、括号不平衡会抛出错误

## 相关导出

- `filterDataset`
- `parseTokensToLisp`
- `parseStringToLisp`
- `normalizeFilterExpression`
- `validateLispExpression`
- `createQueryFilterWorkerClient`
- `attachQueryFilterWorker`

## 示例文件

可参考同目录下的 `usage-example.ts`：

- [usage-example.ts](/Users/tindu/Developer/Code/ai-learn/langchain-learn/packages/utils/src/query-filter/usage-example.ts)
