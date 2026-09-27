# Next RSC Debug

**See what your Next.js Server Components are actually doing.**

Next RSC Debug is a development-focused observability and debugging toolkit for
Next.js App Router applications. It helps you understand the relationship
between browser navigation, RSC requests, server-side fetches, caching, Server
Components, Server Actions, RSC payloads, errors, and client rendering.

> **Core principle:** Don't merely show events. Explain what happened and why.

## Features

- Core event protocol with unique IDs, timestamps, and metadata
- In-memory ring buffer (default 5000 events) with FIFO eviction
- Event subscription support for live updates
- URL sanitization (query strings and credentials stripped by default)
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

### 3. Visit the dashboard

Open `http://localhost:3000/__next-rsc-debug` in your browser.

## Architecture

```
Next.js app
  │
  ▼
Instrumentation (instrumentation.ts)
  │
  ▼
Event Collector (ring buffer)
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

## Packages

- `@next-rsc-debug/core` — Framework-independent event protocol and collector
- `next-rsc-debug` — Next.js integration (server, route, fetch instrumentation)
- `@next-rsc-debug/devtools` — React-based DevTools UI

## Privacy

Next RSC Debug does NOT record:

- Cookies
- Authorization headers
- Request bodies
- Response bodies
- Passwords or tokens
- Database records

Query strings are stripped by default.

## Limitations (v0.1)

- Exact Server Component render timing is NOT available
- Complete internal RSC tree is NOT available
- Native Next.js cache internals are NOT tracked
- Complete Server Action tracing is NOT available
- Production observability is NOT supported
- No Chrome extension
- No cloud dashboard
- No AI explanations

## Roadmap (v0.2)

- Chrome DevTools extension
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