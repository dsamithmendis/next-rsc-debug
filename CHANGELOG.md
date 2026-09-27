# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Fixed

- The GitHub Actions workflow could never have succeeded: it detected the
  package manager as npm (no `yarn.lock` in the repo), ran `next build` at the
  repository root where no Next.js app exists, and uploaded an `./out` directory
  that nothing generated. Replaced with a pnpm-aware CI workflow and a real
  GitHub Pages deployment
- `apps/docs` had no static export configuration, so the Pages build produced
  no output. Added `output: "export"` with `basePath` and `trailingSlash` so the
  docs site is served from `https://<user>.github.io/next-rsc-debug/`
- `.npmrc` was missing a line break, so `linker=isolated-io` and
  `ignore-scripts=false` were parsed as a single malformed key
- `pnpm install` failed with `ERR_PNPM_IGNORED_BUILDS` once ESLint was added,
  because `unrs-resolver` was not listed in `allowBuilds`
- `pnpm lint` was broken: it ran `eslint` through Turborepo, but ESLint was
  never installed, so every package failed with `eslint: command not found`
- `apps/playground` ran `next lint`, which was removed in Next.js 16
- `packages/next/src/fetch-instrument.ts` read `input.method` off a value that
  could be a `string`, silently reporting the wrong HTTP method for
  `fetch(new Request(url, { method: "POST" }))`
- Unused imports and an unused loop variable were left in eight source files
- `playwright-report/` and `test-results/` were not gitignored
- Published `next-rsc-debug@0.1.2` could not be installed: the `workspace:*`
  dependency on `@next-rsc-debug/core` shipped verbatim in the tarball, so
  `npm install next-rsc-debug` failed with `EUNSUPPORTEDPROTOCOL`. Added
  `publishConfig` to `next-rsc-debug` and `@next-rsc-debug/devtools`. Note that
  `npm publish` does **not** rewrite `workspace:*` — use `pnpm publish`
- Relative imports in `packages/*/src` are emitted without `.js` extensions,
  which Node's ESM resolver rejects (`ERR_MODULE_NOT_FOUND`). Source now carries
  explicit `.js` specifiers
- `packages/devtools/src/styles.css` was never copied to `dist/`, so consumers
  received an unstyled dashboard. It is now copied at build time and exported as
  `@next-rsc-debug/devtools/styles.css`
- Apps and examples resolved the packages through tsconfig `paths` pointing at
  `src/`, so the built artifacts were never exercised. They now consume `dist/`
  through normal workspace resolution, matching what consumers get. The examples
  were also missing their `dependencies` on the three packages
- `pnpm-workspace.yaml` shipped an unfilled `allowBuilds` placeholder
  (`esbuild: set this to true or false`), which made every `pnpm` command fail
  with `ERR_PNPM_IGNORED_BUILDS`
- Malformed JSX in `apps/docs/app/privacy/page.tsx` (`<liPasswords or tokens</li>`)
  broke typecheck across the workspace
- The five `examples/*` packages had no source files, so `next build` failed with
  "Couldn't find any `pages` or `app` directory"; each example now ships a
  runnable app demonstrating its scenario
- The dashboard route lived in `app/__next-rsc-debug/`, which is a private folder
  in the App Router and therefore not routable (404). It now lives at
  `/rsc-debug`, with a rewrite preserving the `/__next-rsc-debug` URL
- DevTools components were missing `"use client"` directives and crashed when
  imported into a Server Component; they are now marked as a Client Component
  library
- The event collector was a module-level singleton, which Next.js duplicates per
  route chunk, so events recorded during a Server Component render were
  invisible to the `/api/debug-events` route. The collector is now keyed off a
  `Symbol.for(...)` on `globalThis` and shared across route chunks
- Root `test:unit` script invoked `turbo run test:unit`, but no package defines
  that script, so the tests in `tests/unit/` never ran
- Vitest setup used `@testing-library/jest-dom` instead of the `/vitest` entry,
  so custom DOM matchers were not registered

### Added

- CI workflow running lint, typecheck, unit tests, build, and a packaging check
  on every push and pull request
- GitHub Pages workflow that builds and deploys the documentation site
- `.github/scripts/verify-pack.mjs`, which asserts every `exports` entry point
  each publishable package advertises exists and survives `npm pack` — this
  guards the packaging class of bug that broke `0.1.2`
- ESLint 9 flat config (`eslint.config.mjs`) and the dependencies to run it
- Playwright E2E job in CI
- `CONTRIBUTING.md`, `SECURITY.md`, and a pull request template
- Dependabot configuration for npm, workspace projects, and GitHub Actions
- Issue template configuration routing questions to Discussions
- `engines.node` field declaring the Node.js minimum
- `publishConfig` (public access + registry) for the publishable packages
- `packages/devtools/scripts/copy-css.mjs` to copy static assets into `dist/`
- `./styles.css` export on `@next-rsc-debug/devtools`
- Unit tests for `@next-rsc-debug/devtools` (components and the `useSse` hook)
- Root Vitest config aliases `@next-rsc-debug/core` to package source
- `@playwright/test` and `vitest` as root devDependencies
- `jsdom` devDependency for DevTools component tests

### Changed

- Playwright uses a configurable port (defaults to 3100) instead of 3000, so the
  suite no longer fails when a dev server already occupies 3000. The config also
  sets `forbidOnly`, CI retries, and the GitHub reporter
- Added `.prettierignore` so Prettier stops rewriting `pnpm-lock.yaml` and
  `pnpm-workspace.yaml`, which are tool-owned (Prettier wanted to reformat 4480
  lockfile lines purely to change pnpm's single quotes to double quotes)
- Added `pnpm format:check`, wired into `pnpm check` and CI so formatting
  cannot drift
- Prettier fixed a pre-existing indentation bug in `packages/next/package.json`
  (the `dependencies` block was flush with the left margin)
- Linting is a single root-level `eslint .` run instead of a per-package
  Turborepo task, so one config governs the whole workspace
- `pnpm check` now includes lint
- Issue templates capture the versions that matter for a debugging toolkit
  instead of a generic device/OS form
- Documentation deployment targets `apps/docs` and derives its `basePath` from
  the repository name (or `/` when a custom domain is configured)
- Dashboard path documented as `/rsc-debug` across the root README, package
  READMEs, and the docs site
- README documents the monorepo development workflow, testing layers,
  repository layout, and publishing constraints
- Documented the required DevTools CSS import

## [0.1.0] - 2026-09-27

### Added

- Core event protocol (DebugEvent, DebugEventType)
- In-memory ring buffer (default 5000 events)
- Event subscription support
- URL sanitization (query stripping, credential stripping)
- Next.js instrumentation integration
- Server-side fetch instrumentation
- Request ID correlation
- SSE endpoint for live event streaming
- JSON endpoint for event snapshots
- DevTools dashboard (timeline, fetch inspector, warnings)
- Slow request detection (default 500ms threshold)
- Duplicate request detection
- Playground application with demo scenarios
- Examples (basic, data-fetching, parallel-fetch, slow-request, cache)
- Unit tests (Vitest)
- E2E tests (Playwright)
- Documentation
- npm package configuration
- Type declarations
