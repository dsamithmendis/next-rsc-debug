# Slow Request Example

Demonstrates a slow server-side fetch that triggers the slow-request warning.

## Run

```bash
cd examples/slow-request
pnpm install
NEXT_RSC_DEBUG=1 pnpm dev
```

## What it shows

- Slow fetch detection (800ms)
- Slow-request warning in DevTools
- Performance analysis