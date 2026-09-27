# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-09-27

### Added
- Core event protocol (DebugEvent, DebugEventType)
- In-memory ring buffer (default 5000 events)
- Event subscription support
- URL sanitization (query stripping, credential stripping)
- Next.js instrumentation integration
- Server-side fetch instrumentation
- Request ID correlation
- SSE endpoint for live event streaming
- JSON endpoint for event snapshots
- DevTools dashboard (timeline, fetch inspector, warnings)
- Slow request detection (default 500ms threshold)
- Duplicate request detection
- Playground application with demo scenarios
- Examples (basic, data-fetching, parallel-fetch, slow-request, cache)
- Unit tests (Vitest)
- E2E tests (Playwright)
- Documentation
- npm package configuration
- Type declarations