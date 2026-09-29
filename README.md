# Next RSC Debug

[![CI](https://github.com/dsamithmendis/next-rsc-debug/actions/workflows/ci.yml/badge.svg)](https://github.com/dsamithmendis/next-rsc-debug/actions/workflows/ci.yml)
[![Docs](https://github.com/dsamithmendis/next-rsc-debug/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/dsamithmendis/next-rsc-debug/actions/workflows/deploy-docs.yml)
[![npm](https://img.shields.io/npm/v/next-rsc-debug)](https://www.npmjs.com/package/next-rsc-debug)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**See what your Next.js Server Components are actually doing.**

Next RSC Debug is a development-focused observability and debugging toolkit for
Next.js App Router applications. It helps you understand the relationship
between browser navigation, RSC requests, server-side fetches, caching, Server
Components, Server Actions, RSC payloads, errors, and client rendering.

> **Core principle:** Don't merely show events. Explain what happened and why.

> **No browser extension.** The dashboard is an ordinary page inside your own
> application. Instrumentation runs on your server, events stream over a route
> handler you mount yourself, and the UI is a plain React component — so there
> is nothing to install, no permissions to grant, and no dependency on any one
> browser. See [How it works](#how-it-works).

## How it works

Nothing is injected into the browser. The pipeline is entirely yours:

1. `instrumentation.ts` calls `register()`, which wraps the server's `fetch`
2. Producers (`debugComponent()`, `debugCacheHit()`, …) write events into an
   in-memory ring buffer on `globalThis` in the Node process
3. A route handler you mount serves that buffer as JSON and as a live SSE stream
4. `<DevTools />` — a normal React client component — subscribes and renders

Because the source is a plain endpoint, you can also just `curl
/api/debug-events`, assert on it in CI, or run the whole thing in a container
with no browser installed.

## Features

- DevTools dashboard rendered as an in-page React component — no browser
  extension, no permissions, works in any browser
- Core event protocol with unique IDs, timestamps, and metadata
- In-memory ring buffer (default 5000 events) with FIFO eviction
- Event subscription support for live updates
- URL sanitization (credentials always removed; non-sensitive query parameters
  kept for display and duplicate detection)
- Next.js instrumentation integration via `instrumentation.ts`
- Server-side fetch instrumentation (no bodies, cookies, or auth headers recorded)
- Request ID correlation
- SSE endpoint for live event streaming
- JSON endpoint for event snapshots
- DevTools dashboard with timeline, fetch inspector, and warnings
- Slow request detection (default 500ms threshold, configurable)
- Duplicate request detection
- Playground application with demo scenarios
- Examples for basic fetch, data fetching, parallel fetch, slow request, and cache

## Installation

```bash
pnpm add next-rsc-debug
```

## Setup

### 1. Create `instrumentation.ts`

```ts
// instrumentation.ts

export async function register() {
  if (process.env.NEXT_RSC_DEBUG === "1") {
    const { register } = await import("next-rsc-debug/server");
    await register();
  }
}
```

### 2. Enable debugging

```env
NEXT_RSC_DEBUG=1
```

Debugging stays off unless this variable is exactly `1`, so it is safe to leave
the `instrumentation.ts` in place across environments.

### 3. Add the events endpoint

Create `app/api/debug-events/route.ts` and re-export the built-in handler:

```ts
// app/api/debug-events/route.ts
export { GET } from "next-rsc-debug/route";
```

The handler returns a JSON snapshot for normal requests, and switches to an SSE
stream when the request sends `Accept: text/event-stream`.

### 4. Mount the dashboard

```tsx
// app/rsc-debug/page.tsx
import { DevTools } from "@next-rsc-debug/devtools";
import "@next-rsc-debug/devtools/styles.css";

export default function DebugPage() {
  return <DevTools url="/api/debug-events" />;
}
```

`@next-rsc-debug/devtools` is a **Client Component** library, so you can import
it directly into a Server Component page. Do not wrap it in `next/dynamic`
with `ssr: false` — that is not permitted inside a Server Component on
Next.js 16.

### 5. Visit the dashboard

Open `http://localhost:3000/rsc-debug`.

> **Note on the route name:** App Router folders prefixed with `_` (such as
> `__next-rsc-debug`) are _private_ and are not routable, so a dashboard placed
> there returns 404. Use a path without a leading underscore. To keep the
> `__next-rsc-debug` URL for compatibility, add a rewrite in `next.config.ts`:
>
> ```ts
> async rewrites() {
>   return [{ source: "/__next-rsc-debug", destination: "/rsc-debug" }];
> }
> ```

## Architecture

```
Next.js app
  │
  ▼
Instrumentation (instrumentation.ts)
  │
  ▼
Event Collector (ring buffer, shared via globalThis)
  │
  ├─► Ring Buffer (in-memory)
  │
  ├─► Analyzer (warnings)
  │
  ▼
SSE endpoint (/api/debug-events)
  │
  ▼
DevTools UI
  ├─► Timeline
  ├─► Fetch Inspector
  ├─► Warnings
  └─► Event Details
```

### Why the collector is stored on `globalThis`

Next.js bundles every route into its own server chunk, so a module-level
singleton is instantiated once **per route**. Events recorded while rendering a
Server Component would land in a different collector instance from the one the
`/api/debug-events` route reads, leaving the dashboard permanently empty. The
collector is therefore keyed off a `Symbol.for(...)` on `globalThis` so that all
route chunks share a single ring buffer within the process.

## Packages

| Package                    | Description                                                |
| -------------------------- | ---------------------------------------------------------- |
| `@next-rsc-debug/core`     | Framework-independent event protocol and collector         |
| `next-rsc-debug`           | Next.js integration (server, route, fetch instrumentation) |
| `@next-rsc-debug/devtools` | React-based DevTools UI (Client Component)                 |

## Development

This is a pnpm + Turborepo monorepo. Node 20.9+ is required; the exact pnpm
version is pinned in `package.json` via `packageManager`.

```bash
pnpm install     # install workspace dependencies
pnpm dev         # run all dev servers
pnpm build       # build all packages, apps, and examples
pnpm typecheck   # tsc --noEmit across the workspace
pnpm lint        # ESLint across the workspace
pnpm format      # Prettier --write
pnpm test        # all unit tests (packages + root integration tests)
pnpm check       # typecheck && lint && format:check && test
```

Run a single package with the usual filter syntax:

```bash
pnpm --filter @next-rsc-debug/core test
pnpm --filter playground dev
```

Linting is a single root-level `eslint .` run governed by
`eslint.config.mjs`, so there is one config for the whole workspace.

### Continuous integration

| Workflow                            | Trigger               | What it does                                             |
| ----------------------------------- | --------------------- | -------------------------------------------------------- |
| `.github/workflows/ci.yml`          | push and PR to `main` | Lint, typecheck, unit tests, build, packaging check, E2E |
| `.github/workflows/deploy-docs.yml` | push to `main`        | Builds and publishes `apps/docs` to GitHub Pages         |

The packaging check (`.github/scripts/verify-pack.mjs`) asserts that every
`exports` entry point each publishable package advertises exists in `dist/`
**and** survives `npm pack`, which is the class of bug that made
`next-rsc-debug@0.1.2` uninstallable.

### Documentation site

`apps/docs` is a statically exported Next.js site deployed to GitHub Pages at
<https://dsamithmendis.github.io/next-rsc-debug/>. It is served from a
subpath, so the build injects a `basePath`:

```bash
pnpm --filter docs dev    # local dev at http://localhost:3000
pnpm --filter docs build  # emits apps/docs/out
```

Setting a `PAGES_DOMAIN` repository variable switches the deployed site to a
custom domain, in which case `basePath` becomes `/`.

> Only the docs site can be deployed to GitHub Pages. The playground and the
> examples expose API routes (including the SSE event stream) and therefore need
> a server, so run them locally with `pnpm dev`.

### Testing notes

`pnpm test` runs two layers:

- **Package unit tests** — Vitest per package (`packages/*/src/**/*.test.ts`)
- **Root integration tests** — Vitest against `tests/unit/**`, exercising the
  public `@next-rsc-debug/core` API surface

The root Vitest config aliases `@next-rsc-debug/core` to the package source, so
root tests run against `src` rather than a stale `dist`.

End-to-end tests live in `tests/e2e` and require Playwright browsers plus a
running playground:

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

The suite starts the playground itself on port 3100. Set `E2E_PORT` to use a
different port if 3100 is already taken:

```bash
E2E_PORT=3200 pnpm test:e2e
```

### Repository layout

```
packages/core        # event protocol, ring buffer, analyzer, collector
packages/next        # Next.js integration + fetch instrumentation
packages/devtools    # React DevTools UI
apps/playground      # demo scenarios (basic, slow, parallel, cache, duplicate, error)
apps/docs            # documentation site
examples/*           # standalone minimal apps, one per scenario
tests/unit           # root integration tests
tests/e2e            # Playwright tests
```

Each example is a self-contained Next.js app demonstrating a single scenario:

| Example                   | Demonstrates                               |
| ------------------------- | ------------------------------------------ |
| `examples/basic`          | A single server-side fetch                 |
| `examples/data-fetching`  | Sequential fetches with cache events       |
| `examples/parallel-fetch` | Concurrent fetches on the timeline         |
| `examples/slow-request`   | An 800ms fetch that trips the slow warning |
| `examples/cache`          | Explicit cache hit, miss, and invalidate   |

Run one with:

```bash
cd examples/basic
NEXT_RSC_DEBUG=1 pnpm dev
```

### Publishing

The apps and examples consume the **built `dist/`** output rather than `src/`
via tsconfig `paths`. This means the workspace exercises the same artifacts
consumers get, so packaging problems surface locally instead of after publish.

> **Always publish with `npm publish --access public`, not `pnpm publish`.** The
> packages depend on each other via a concrete version (for example `0.1.6`), so
> `npm pack` / `npm publish` leaves the correct dependency string in the tarball.

Local verification against the real tarballs:

```bash
pnpm --filter "@next-rsc-debug/core" --filter "next-rsc-debug" --filter "@next-rsc-debug/devtools" build
pnpm -r pack --pack-destination /tmp/nrpacks
# then install those .tgz files into a scratch Next.js app
```

Relative imports inside `packages/*/src` carry explicit `.js` extensions so the
emitted ESM is valid for Node's resolver. The DevTools stylesheet is copied to
`dist/` at build time and exposed as `@next-rsc-debug/devtools/styles.css`;
import it once in your app so the dashboard is styled:

```tsx
import "@next-rsc-debug/devtools/styles.css";
```

## Privacy

Next RSC Debug does NOT record:

- Cookies
- Authorization headers
- Request bodies
- Response bodies
- Passwords or tokens
- Database records

These guarantees are enforced in `createEvent`, at the single point every event
is constructed, rather than at each call site. Metadata keys matching a
sensitive list (`token`, `password`, `authorization`, `cookie`, `csrf`,
`private_key`, …) are stripped at every nesting level, and values that cannot be
safely serialized are normalized — `Date` to ISO, `BigInt` to string, cycles to a
`"[Circular]"` marker. A new producer cannot bypass this by accident.

Query strings keep their non-sensitive parameters, so a fetch to
`/api/slow?delay=800` is recorded as `http://host/api/slow?delay=800`; `?token=…`
and any other sensitive parameter is removed, as are embedded `user:password@`
credentials. Call `sanitizeUrl(url)` without `{ preserveQuery: true }` to get the
older, fully-stripped behaviour.

Email addresses in cache keys passed to `debugCacheHit` / `debugCacheMiss` /
`debugCacheInvalidate` are redacted to their first character and domain
(`alice@example.com` → `a***@example.com`), which keeps events about the same
user correlatable without retaining the address.

All state is held in memory in the running process. Nothing is persisted to disk
or transmitted off the machine.

## Limitations (v0.1)

- Exact Server Component render timing is NOT available
- Complete internal RSC tree is NOT available
- Native Next.js cache internals are NOT tracked
- Complete Server Action tracing is NOT available
- Production observability is NOT supported
- No cloud dashboard
- No AI explanations

A browser extension is deliberately **not** on this list: none is needed, and
none is planned. The dashboard is an in-page React component — see
[How it works](#how-it-works). An extension is on the roadmap only as an
optional convenience for docking the UI in the DevTools panel.

## Roadmap (v0.2)

- Optional Chrome DevTools panel for the existing in-page dashboard
- VS Code extension
- Persistent traces
- Trace comparison
- CI performance regression detection
- Server Action tracing
- Cache analysis
- RSC payload analysis
- Production-safe authenticated telemetry
- Team dashboard
- Optional cloud product

## License

MIT

## Author

Samith Mendis
