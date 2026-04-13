# Repository Guidelines

## 项目结构与模块组织
本仓库是基于 Bun Workspace 和 Turbo 的 monorepo。业务应用放在 `apps/`，共享库放在 `packages/`，仓库级脚本放在 `tools/`。

- `apps/client`：React 19 + Vite 前端，源码位于 `src/`，静态资源在 `src/assets/`
- `apps/server`：Bun + Hono API 服务，源码位于 `src/`，Drizzle 配置在 `drizzle.config.ts`
- `packages/shared`：共享 schema、类型、常量和工具函数的单一事实来源
- `packages/ui`：共享 UI 包，目前内容较少

## 构建、测试与开发命令
除特别说明外，以下命令均在仓库根目录执行。

- `bun install`：安装所有 workspace 依赖
- `bun run dev`：通过 Turbo 启动开发任务
- `bun run build`：构建全部 workspace
- `bun run test`：运行仓库测试
- `bun run typecheck`：执行 TypeScript build references 检查
- `bun run lint`：运行 `oxfmt` 和 `oxlint`，并自动修复可修复问题
- `cd apps/server && bun run db:generate && bun run db:migrate`：生成并执行数据库迁移
- `cd apps/client && bun run test:coverage`：前端新增测试后可用此命令查看覆盖率

## 代码风格与命名约定
仓库统一使用 TypeScript。遵循现有代码风格：2 空格缩进、单引号、默认不写分号；提交前运行 `bun run lint` 统一格式。

React 组件使用 `PascalCase`，如 `App.tsx`、`Button.tsx`；变量和函数使用 `camelCase`；工具模块文件名使用 `kebab-case`，如 `response-factory.ts`、`id-generator.ts`。优先保持数据不可变，并在边界层校验所有外部输入。

## 测试规范
新功能和缺陷修复优先采用测试驱动方式。当前测试框架为 Vitest，已提交测试主要位于 `packages/shared/tests/**/*.test.ts`。新增测试请沿用 `*.test.ts` 或 `*.test.tsx` 命名。

涉及前后端共享契约时，把运行时 schema 和由 schema 派生的 TypeScript 类型统一放在 `packages/shared/src/types`，通过 `@lcl/shared/types` 使用；共享工具函数统一放在 `packages/shared/src/utils`，通过 `@lcl/shared/utils` 使用。

所有行为变更都应补充测试，目标是受影响代码覆盖率不低于 80%。提交 PR 前至少运行一次 `bun run test`；本地迭代时可进入对应 workspace 单独执行测试。

## Commit 与 Pull Request 规范
最近提交记录以简短、祈使句风格为主，部分提交使用 conventional commit 前缀，如 `fix:`、`chore:`。新增提交建议保持这种格式，例如 `fix: handle empty chat payload`。

PR 需要说明变更内容、影响的 workspace、环境变量或迁移步骤；涉及前端界面变更时附上截图。如有关联 issue，请一并链接，并说明测试覆盖情况或已知缺口。

## 安全与配置提示
从 `.env.example` 复制本地环境配置，不要提交真实密钥。服务端环境变量统一收口在 `apps/server/src/config/env.ts`，新增配置时请同步更新该文件。
