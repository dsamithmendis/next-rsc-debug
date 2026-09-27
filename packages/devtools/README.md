# @next-rsc-debug/devtools

React-based DevTools UI for Next RSC Debug.

## Features

- Event timeline
- Request list
- Fetch inspector
- Warnings panel
- Connection status indicator
- Event details
- Basic filtering (All, Navigation, RSC, Fetch, Cache, Actions, Errors, Slow only, Errors only)
- Live SSE updates

## Installation

```bash
pnpm add @next-rsc-debug/devtools
```

## Usage

The package ships `"use client"` directives, so you can import it directly into
an App Router Server Component page. Do **not** wrap it in `next/dynamic` with
`ssr: false` — that is not permitted inside a Server Component on Next.js 16.

```tsx
// app/rsc-debug/page.tsx
import { DevTools } from "@next-rsc-debug/devtools";
import "@next-rsc-debug/devtools/styles.css";

export default function DebugPage() {
  return <DevTools url="/api/debug-events" />;
}
```

Pair it with the built-in events endpoint:

```ts
// app/api/debug-events/route.ts
export { GET } from "next-rsc-debug/route";
```

> Avoid naming the page folder with a leading underscore (for example
> `__next-rsc-debug`). App Router treats underscore-prefixed folders as private
> and they are not routable, so the page would return 404. Use a path such as
> `/rsc-debug` instead.

## License

MIT
