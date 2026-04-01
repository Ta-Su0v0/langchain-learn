# LangChain Learn Monorepo

一个用于学习 LangChain、前后端分层、共享契约和工程化配置的 Bun Monorepo。

当前仓库已经具备：

- Web Client：React 19 + Vite 8 + Tailwind CSS v4
- API Server：Bun + Hono + Zod + Drizzle ORM
- Shared Contracts：`@lcl/types`、`@lcl/utils`
- Monorepo Tooling：Bun Workspaces + Turbo + TypeScript solution-style + OXC

当前聊天链路仍是持久化 + stub 回复，LangChain / Google 相关依赖已就位，但尚未接入真实模型调用。

## 仓库结构

```text
apps/
  client/         React 前端应用
  server/         Bun API 服务
packages/
  types/          前后端共享类型与 API 契约
  utils/          共享响应封装与工具函数
  ui/             预留 UI 组件包（当前入口仍为占位）
tools/
  scripts/        预留仓库级脚本 workspace
```

## 技术栈

- Package Manager: Bun `1.3.11`
- Engine Constraint: Node `24.x` + Bun `>=1.3.11`
- Build Orchestration: Turbo
- TypeScript Layout: root solution-style + `tsconfig.base.json`
- Lint / Format: OXLint + OXFmt
- Frontend: React 19, Vite 8, Vitest, Tailwind CSS v4
- Backend: Bun, Hono, Zod, Postgres, Drizzle ORM

## 快速开始

### 1. 安装依赖

```bash
bun install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

默认环境变量如下：

| Key | 说明 | 默认值 |
| --- | --- | --- |
| `NODE_ENV` | 服务运行环境 | `development` |
| `PORT` | API 服务端口 | `3000` |
| `CLIENT_ORIGIN` | 允许跨域的前端地址 | `http://localhost:5173` |
| `DATABASE_URL` | Postgres 连接串 | `postgres://postgres:postgres@localhost:5432/langchain_learn` |
| `OPENAI_API_KEY` | 预留给模型接入 | 空 |

补充说明：

- 服务端环境加载器还支持 `GOOGLE_API_KEY`，用于后续 Google 模型接入。
- 客户端支持额外的 `VITE_API_BASE_URL`，未设置时默认走 `/api/v1`。

### 3. 准备 Postgres

确保本地 Postgres 已启动，并创建数据库：

```bash
createdb langchain_learn
```

### 4. 生成并执行数据库迁移

```bash
cd apps/server
bun run db:generate
bun run db:migrate
```

### 5. 启动开发环境

回到仓库根目录：

```bash
bun run dev
```

启动后默认访问地址：

- Client: [http://localhost:5173](http://localhost:5173)
- Server: [http://localhost:3000](http://localhost:3000)
- Health Check: [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health)

## Debugger

### VS Code

仓库已经提供可直接使用的 VS Code 调试配置：

- `Server: Bun API`
- `Server: Attach Bun Inspector`
- `Client: Chrome`
- `Full Stack: Server + Client`

使用前请安装推荐扩展 `oven.bun-vscode`。

说明：

- `Server: Bun API` 会直接以 Bun 扩展启动 `apps/server/src/index.ts`
- `Client: Chrome` 会先启动 `apps/client` 的 Vite dev server，再拉起浏览器调试
- `Full Stack: Server + Client` 会同时启动前后端调试
- `Server: Attach Bun Inspector` 用于附加到 `bun run debug` 启动的服务端 Inspector

### Zed

仓库已经补齐 Zed 本地调试配置，入口位于 `.zed/debug.json`：

- `Server: Bun API`
- `Client: Chrome (Vite)`
- `Client: Attach Chrome (9222)`

配套运行任务位于 `.zed/tasks.json`：

- `server:dev`
- `server:debug`
- `client:dev`

建议用法：

- 先运行 `client:dev`，再启动 `Client: Chrome (Vite)`
- 调服务端时直接启动 `Server: Bun API`
- 如果要用 Bun 官方 Inspector，运行 `server:debug`
- 当前配置按 `workspace` 容器地址 `192.168.64.2` 预设浏览器调试 URL 和前端 API 基址；如果容器 IP 变化，需要同步更新 `.zed/debug.json`、`.zed/tasks.json` 和 `.vscode/tasks.json`

补充说明：

- Zed 当前内置的 JavaScript 调试器是 `vscode-js-debug`，主要覆盖 `node` / `chrome` 场景
- `Bun Inspector attach` 仍建议走 Bun 官方 Web Debugger，而不是在 Zed 里伪造一个不兼容的 attach 配置

### Bun Web Debugger

如果你要调试服务端运行时本身，官方推荐使用 Bun Inspector：

```bash
cd apps/server
bun run debug
```

然后在浏览器打开：

- [https://debug.bun.sh/#localhost:6499/lcl-server](https://debug.bun.sh/#localhost:6499/lcl-server)

## 根目录常用脚本

以下命令统一在根目录执行：

```bash
bun run dev         # turbo run dev
bun run build       # turbo run build
bun run test        # turbo run test
bun run typecheck   # tsc -b --pretty false
bun run fix         # oxfmt . && oxlint . --fix
```

说明：

- `turbo.json` 当前只编排 `dev`、`build`、`test`
- 根 `typecheck` 走 TypeScript build references
- 根 `fix` 会直接写回格式和 lint 修复结果

## Workspace 说明

### `apps/client`

- 负责聊天 UI、消息输入、消息展示和 API 调用
- 当前默认通过 `/api/v1` 调后端
- 具备 `dev`、`build`、`preview`、`test`、`test:watch`、`test:coverage` 脚本

### `apps/server`

- 提供 `GET /`、`GET /api/v1/health`
- 提供聊天接口：
  - `POST /api/v1/chat`
  - `GET /api/v1/chat/:sessionId`
- 负责环境变量读取、CORS、中间件、Drizzle 持久化
- 当前 `chat.service.ts` 仍返回 stub 回复，并把会话写入 Postgres

### `packages/types`

- 定义 API 响应结构、聊天消息契约、长度限制等共享类型

### `packages/utils`

- 提供 `createSuccessResponse`、`createErrorResponse`、`generateId`

### `packages/ui`

- 当前入口 `src/index.ts` 仍是占位导出
- 仓库内已有实验性 `Button.tsx`，但尚未从包入口导出

### `tools/scripts`

- 预留给后续仓库级自动化脚本

## TypeScript 与工程化约定

- 根 `tsconfig.json` 为 solution-style 聚合入口
- 共享编译选项位于 `tsconfig.base.json`
- 前端浏览器类型在 `apps/client/tsconfig.json` 中显式声明
- Turbo 会对 `bun.lock`、`package.json`、`tsconfig.json`、`tsconfig.base.json` 变化触发缓存失效

## 当前状态

这个仓库适合作为第一阶段的全栈学习骨架，但还不是“真实 LLM 产品”状态。当前最重要的事实有两点：

1. 聊天接口已经具备 HTTP、校验、持久化和响应封装，但回复仍是 stub。
2. LangChain、Google、OpenAI 相关依赖和环境变量是为下一阶段集成预留的，不代表当前请求链路已经接入真实模型。
