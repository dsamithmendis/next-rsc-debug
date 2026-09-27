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

```tsx
import { DevTools } from "@next-rsc-debug/devtools";

export default function DebugPage() {
  return <DevTools url="/api/debug-events" />;
}
```

## License

MIT