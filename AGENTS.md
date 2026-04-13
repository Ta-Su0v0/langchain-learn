# Repository Guidelines

## Project Structure & Module Organization
This repository is a Bun workspace monorepo orchestrated with Turbo. Code lives in `apps/`, shared libraries in `packages/`, and repo-level utilities in `tools/`.

- `apps/client`: React 19 + Vite frontend (`src/`, assets in `src/assets/`)
- `apps/server`: Bun + Hono API server (`src/`, Drizzle config in `drizzle.config.ts`)
- `packages/shared`: single source of truth for shared schemas, types, constants, and utilities
- `packages/ui`: shared UI package, currently minimal

## Build, Test, and Development Commands
Run commands from the repo root unless a workspace path is shown.

- `bun install`: install workspace dependencies
- `bun run dev`: start all dev tasks through Turbo
- `bun run build`: build every workspace
- `bun run test`: run workspace tests through Turbo
- `bun run typecheck`: run TypeScript build references
- `bun run lint`: format and auto-fix with `oxfmt` and `oxlint`
- `cd apps/server && bun run db:generate && bun run db:migrate`: generate and apply Drizzle migrations
- `cd apps/client && bun run test:coverage`: run client coverage when frontend tests are added

## Coding Style & Naming Conventions
Use TypeScript throughout. Follow the existing style: 2-space indentation, single quotes, and no semicolons. Let `bun run lint` normalize formatting before review.

Use `PascalCase` for React components (`App.tsx`, `Button.tsx`), `camelCase` for variables and functions, and `kebab-case` for utility modules (`response-factory.ts`, `id-generator.ts`). Prefer new objects over mutation, and validate all external input at the boundary layer.

## Testing Guidelines
Prefer test-driven changes for new features and bug fixes. Existing tests use Vitest and are currently concentrated in `packages/shared/tests/**/*.test.ts`. Follow the same `*.test.ts` or `*.test.tsx` naming pattern.

When adding or changing cross-app contracts, put the runtime schema and derived TypeScript types in `packages/shared/src/types` and consume them via `@lcl/shared/types`. Put shared helpers in `packages/shared/src/utils` and consume them via `@lcl/shared/utils`.

Add tests for every behavior change and target at least 80% coverage on touched code. Run `bun run test` before opening a PR; use workspace-level commands when iterating locally.

## Commit & Pull Request Guidelines
Recent history uses short, imperative subjects, with conventional prefixes in some commits (`fix:`, `chore:`). Prefer that format for new work, for example `fix: handle empty chat payload`.

PRs should describe the change, list affected workspaces, mention environment or migration steps, and include screenshots for UI updates. Link the relevant issue when one exists, and note test coverage or any intentional gaps.

## Security & Configuration Tips
Start from `.env.example`; keep secrets in local env files and never commit real keys. Server runtime configuration is centralized in `apps/server/src/config/env.ts`, so update that file when adding new environment variables.
