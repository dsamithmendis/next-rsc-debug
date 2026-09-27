# next-rsc-debug

**See what your Next.js Server Components are actually doing.**

A development-focused observability and debugging toolkit for Next.js App Router
applications.

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

### 3. Visit the dashboard

Open `http://localhost:3000/__next-rsc-debug`.

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