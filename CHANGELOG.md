# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [0.2.2] - 2026-09-30

### Changed

- `next-rsc-debug` and `@next-rsc-debug/devtools` now depend on
  `@next-rsc-debug/core@0.2.2` as a concrete published version instead of the
  `workspace:*` protocol, so the published tarballs install cleanly outside the
  monorepo

### Verification

- Confirmed `0.2.1` is resolvable from the public registry (the earlier
  `ETARGET` errors were registry propagation lag, not a failed publish) and
  released `0.2.2` from the same commit

## [0.2.1] - 2026-09-29

### Fixed

- `pnpm lint` crashed on startup after Dependabot bumped TypeScript to 7.0.2.
  `typescript-eslint@8.70.1` declares a peer range of `typescript >=4.8.4 <6.1.0`
  and hard-fails on TS 7, so every `eslint` invocation exited 2 before linting a
  single file. TypeScript is pinned to `^6.0.3`, the newest release inside that
  supported range
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

## [0.2.0] - 2026-09-29

### Added

- Documented that no browser extension is required or planned. The README, both
  package READMEs, and the docs Overview now describe the full pipeline
  (`instrumentation.ts` → `globalThis` event buffer → your own route handler →
  an in-page React component), and call out that nothing is injected into the
  browser
- `PanelBoundary`, exported from `@next-rsc-debug/devtools`, composing a class
  error boundary with a Suspense boundary. Every panel in the dashboard is
  wrapped in one, so a malformed event renders an inline error instead of
  white-screening the UI, and a suspended panel shows a skeleton. Takes a
  `resetKey` because error boundaries do not reset on their own
- `sanitizeMetadata()` in `@next-rsc-debug/core`, applied centrally in
  `createEvent()`. Strips sensitive keys at every nesting level and normalizes
  values that are unsafe to broadcast: `Date`→ISO, `Map`/`Set`→plain,
  `BigInt`→string, `Error`→`{name,message}`, cycles→`"[Circular]"`. Bounded by
  depth, array length and string length
- `sanitizeKey()`, used by `debugCacheHit`/`debugCacheMiss`/`debugCacheInvalidate`.
  Redacts the local part of any email address in a cache key, keeping the domain
  so events about the same user can still be correlated
- `sanitizeUrl(url, { preserveQuery: true })`, which keeps non-sensitive query
  parameters instead of dropping the whole query string. Sensitive parameters and
  embedded credentials are still removed
- `useSse(url, { maxEvents })` bounds the events retained in the browser.
  Defaults to the same `DEFAULT_MAX_EVENTS` the server ring buffer uses, now
  exported from core, so the two cannot drift apart
- `Timeline` accepts `maxItems` (default 200) and renders only the most recent
  rows, with a notice stating how many were not rendered
- `"clean"` scripts for `core`, `devtools` and `next`

### Fixed

- **Sensitive metadata was persisted and broadcast to every connected browser.**
  `isSafeKey` existed but was never called, so `debugCacheHit("s", { token })`
  stored a live credential in the `globalThis` collector and streamed it over an
  SSE endpoint served with `Access-Control-Allow-Origin: *`
- **One unserializable event could 500 the SSE endpoint.** The initial snapshot
  called `JSON.stringify` with no `try`/`catch`; a circular reference or `BigInt`
  in metadata made `addSseClient` throw and the dashboard could never connect
- **A serialization failure silently ended the stream.** The per-event `catch`
  assumed any error was a dead socket and unsubscribed the client, so a single bad
  payload left a healthy connection quietly frozen. `formatSseEvent` is now total
  by construction, which makes that `catch` truthful
- **Query strings were over-sanitized, causing false duplicate warnings.**
  `/api/items?page=1` and `/api/items?page=2` both normalized to `/api/items` and
  were reported as duplicates of each other
- **Cross-package changes were invisible until release.** `next` and `devtools`
  resolved `@next-rsc-debug/core` from the npm registry rather than the workspace,
  so a local edit to `core` failed with confusing "not a function" or "has no
  exported member" errors. Dependencies now use the `workspace:` protocol
- **Deleting `dist/` produced a silently partial build.** All three packages set
  `incremental: true` but none had a `clean` script, so `tsc` skipped
  re-emitting unchanged files and Turborepo then replayed the broken output from
  cache. `clean` now removes `dist` and `tsconfig.tsbuildinfo` together

### Changed

- **`@next-rsc-debug/devtools` no longer marks its barrel `"use client"`.**
  Previously every non-component export reached a Server Component as a _client
  reference_, so `FILTER_OPTIONS.map(...)` would have thrown. The boundary is now
  per module: `DevTools`, `FilterControls`, `useSse` and `PanelBoundary` are
  client; `Summary`, `Timeline`, `Warnings` and `FetchInspector` are
  server-renderable. The import path is unchanged
- `Summary` and `Warnings` accept an optional `warnings` prop. `DevTools` now runs
  `analyzeEvents` once and shares the result, instead of each panel recomputing the
  same O(n) pass
- `useSse` coalesces bursts of SSE messages into one state commit per frame
  instead of one per message, which was quadratic in the number of events
- `FetchInspector` is memoized; it renders from a single event and was
  re-rendering on every streamed event
- `"sideEffects": false` on `@next-rsc-debug/core` (and a CSS-scoped variant on
  `devtools`) lets bundlers drop `collector` and `RingBuffer` from the client
  bundle. Verified absent from the built client chunks

### Breaking

- The `devtools` barrel no longer carries `"use client"`. Consumers that relied
  on `FILTER_OPTIONS` or `filterEvents` arriving as client references will now
  receive real values, which is the fix, but code written against the old
  behaviour will behave differently
- `packages/next` and `packages/devtools` now depend on `workspace:*` for
  `@next-rsc-debug/core`. pnpm rewrites this to a concrete version on publish
- Duplicate detection now preserves non-sensitive query parameters, so requests
  that differ only by a non-sensitive query parameter are no longer reported as
  duplicates

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
