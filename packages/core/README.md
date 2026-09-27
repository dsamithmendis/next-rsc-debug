# @next-rsc-debug/core

Framework-independent event protocol and collector for Next RSC Debug.

## Features

- DebugEvent types and factories
- Event IDs, timestamps, and metadata
- In-memory ring buffer (default 5000 events)
- Event subscription support
- URL sanitization utilities
- Analyzer primitives (slow request, duplicate request, error detection)
- Warning detection

## Installation

```bash
pnpm add @next-rsc-debug/core
```

## Usage

```ts
import { createEvent, getCollector, analyzeEvents } from "@next-rsc-debug/core";

const event = createEvent({
  type: "fetch:start",
  metadata: { url: "/api/foo" },
});
getCollector().push(event);

const events = getCollector().list();
const { warnings } = analyzeEvents(events);
```

## License

MIT
