# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Fixed

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

- `publishConfig` (public access + registry) for the publishable packages
- `packages/devtools/scripts/copy-css.mjs` to copy static assets into `dist/`
- `./styles.css` export on `@next-rsc-debug/devtools`
- Unit tests for `@next-rsc-debug/devtools` (components and the `useSse` hook)
- Root Vitest config aliases `@next-rsc-debug/core` to package source
- `@playwright/test` and `vitest` as root devDependencies
- `jsdom` devDependency for DevTools component tests

### Changed

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
