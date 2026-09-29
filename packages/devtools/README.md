# @next-rsc-debug/devtools

React-based DevTools UI for Next RSC Debug.

The dashboard is a normal React page mounted inside your application, not a
browser extension. There is nothing to install, no permissions to grant, and no
dependency on a particular browser; events reach it over an SSE route handler
that you mount yourself.

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

`DevTools` is a Client Component (it opens an `EventSource`), so you can render
it directly from an App Router Server Component page. Do **not** wrap it in
`next/dynamic` with `ssr: false` — that is not permitted inside a Server
Component on Next.js 16.

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

## Client boundaries

The package root has **no** `"use client"` directive, so the import path above
works identically from a Server or a Client Component. The boundary is per
module:

| Export                           | Boundary          | Why                               |
| -------------------------------- | ----------------- | --------------------------------- |
| `DevTools`                       | `"use client"`    | Owns state and the SSE connection |
| `FilterControls`                 | `"use client"`    | Button `onClick` handlers         |
| `useSse`                         | `"use client"`    | Opens an `EventSource`            |
| `PanelBoundary`                  | `"use client"`    | Class error boundary + Suspense   |
| `Summary`                        | server-renderable | Reads serializable props only     |
| `Timeline`                       | server-renderable | `onSelect` is optional            |
| `Warnings`                       | server-renderable | Reads serializable props only     |
| `FetchInspector`                 | server-renderable | Renders one event                 |
| `FILTER_OPTIONS`, `filterEvents` | plain values      | Data and a pure function          |

Because the barrel is not itself a client module, `FILTER_OPTIONS` and
`filterEvents` are real values rather than client references, so a Server
Component can read and call them directly.

### Fault isolation

Every panel in `DevTools` is wrapped in a `PanelBoundary`, which composes an
error boundary with a Suspense boundary:

- a panel that throws renders an inline error in place, and **sibling panels
  keep working** — a single malformed event cannot white-screen the dashboard
- a panel that suspends (a future `use()`, or lazy-loaded panel code) shows a
  skeleton instead of blocking the dashboard

Because error boundaries do not reset on their own, `PanelBoundary` takes a
`resetKey`; changing it clears the caught error and re-renders. `DevTools`
derives each key from the inputs that panel depends on, so a panel that failed
once recovers as soon as the offending data changes.

`PanelBoundary` is exported, so you can use it when composing your own
dashboard from the presentational components:

```tsx
<PanelBoundary label="Timeline" resetKey={`${events.length}`}>
  <Timeline events={events} />
</PanelBoundary>
```

### Rendering panels without the live stream

The presentational components can be rendered server-side with events you
already have, which avoids shipping the SSE client entirely:

```tsx
import { Summary, Warnings } from "@next-rsc-debug/devtools";
import { analyzeEvents, getCollector } from "@next-rsc-debug/core";

export default function ReportPage() {
  const events = getCollector().list();
  const { warnings } = analyzeEvents(events, { slowThreshold: 500 });

  return (
    <>
      <Summary events={events} threshold={500} warnings={warnings} />
      <Warnings events={events} threshold={500} warnings={warnings} />
    </>
  );
}
```

Pass `warnings` to both to run the analysis once instead of once per panel;
omit it and each component computes its own.

### Bounded history

Two independent caps keep the dashboard responsive on long-running sessions:

```tsx
// Client-side buffer: defaults to core's DEFAULT_MAX_EVENTS (5000)
const { events } = useSse("/api/debug-events", { maxEvents: 2000 });

// Rendered rows: defaults to 200, showing the most recent
<Timeline events={events} maxItems={100} />;
```

When the timeline truncates it says so, rather than silently showing a subset.

## License

MIT
