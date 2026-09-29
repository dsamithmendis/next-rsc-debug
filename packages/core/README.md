# @next-rsc-debug/core

Framework-independent event protocol and collector for Next RSC Debug.

## Features

- DebugEvent types and factories
- Event IDs, timestamps, and metadata
- In-memory ring buffer (default 5000 events)
- Event subscription support
- URL sanitization utilities
- Metadata sanitization: sensitive keys stripped, values normalized to be
  JSON-safe, applied centrally in `createEvent`
- Cache key redaction for email addresses
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

## Sanitization

`createEvent` runs every `metadata` object through `sanitizeMetadata` before the
event is returned, so sensitive keys and unserializable values cannot reach the
collector — and from there any SSE stream — regardless of which producer
supplied them:

```ts
createEvent({
  type: "cache:hit",
  metadata: {
    key: "post:1",
    authorization: "Bearer secret", // stripped
    at: new Date(), // normalized to an ISO string
  },
});
// metadata === { key: "post:1", at: "2026-09-29T…" }
```

`stripSensitiveQueryParams` is reachable through
`sanitizeUrl(url, { preserveQuery: true })`, which keeps non-sensitive query
parameters for display and duplicate detection while still removing sensitive
ones and embedded credentials.

## License

MIT
