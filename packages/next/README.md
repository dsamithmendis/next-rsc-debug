# next-rsc-debug

**See what your Next.js Server Components are actually doing.**

A development-focused observability and debugging toolkit for Next.js App Router
applications.

Everything runs on your server and your own routes: `instrumentation.ts` wraps
`fetch`, events are buffered in your Node process, a route handler you mount
serves them as JSON and SSE, and the dashboard is an ordinary React page in
your app. **No browser extension is required or planned** — nothing is injected
into the browser, so there is nothing to install, no permissions to grant, and
no dependency on a particular browser.

## Installation

```bash
pnpm add next-rsc-debug
```

## Quick Start

### 1. Create `instrumentation.ts`

```ts
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

### 3. Add the events endpoint

```ts
// app/api/debug-events/route.ts
export { GET } from "next-rsc-debug/route";
```

### 4. Mount the dashboard

```tsx
// app/rsc-debug/page.tsx
import { DevTools } from "@next-rsc-debug/devtools";

export default function DebugPage() {
  return <DevTools url="/api/debug-events" />;
}
```

### 5. Visit the dashboard

Open `http://localhost:3000/rsc-debug`.

> Do not name the page folder `__next-rsc-debug`. Underscore-prefixed folders
> are private in the App Router and are not routable, so the page returns 404.
> Add a rewrite in `next.config.ts` if you need to keep that URL.

## What is Observed

- Navigation events
- RSC requests (where reliably observable)
- Server-side fetches (method, URL, duration, status, content-length)
- Cache events (explicit via `debug.cache.*` APIs)
- Errors

## What is NOT Observed (v0.1)

- Exact Server Component render timing
- Complete internal RSC tree
- Native Next.js cache internals
- Complete Server Action tracing

## Privacy

This tool does NOT record:

- Cookies
- Authorization headers
- Request bodies
- Response bodies
- Passwords or tokens
- Database records

Query strings are stripped by default.

## License

MIT
