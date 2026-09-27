/**
 * Public API for next-rsc-debug.
 */

export {
  createEvent,
  createRequestId,
  createNavigationId,
  createEventId,
  type DebugEvent,
  type DebugEventType,
  type CreateEventOptions,
  sanitizeUrl,
  stripSensitiveQueryParams,
  RingBuffer,
  analyzeEvents,
  getCollector,
  createCollector,
  setCollector,
  resetCollector,
  type Collector,
  type Warning,
  type WarningType,
  type WarningSeverity,
} from "@next-rsc-debug/core";

export {
  register,
  unregister,
  isDebuggingEnabled,
  type RegisterOptions,
} from "./server.js";
export {
  wrapFetch,
  unwrapFetch,
  isFetchInstrumented,
} from "./fetch-instrument.js";
export { handleDebugEvents, isDebugRequest } from "./route-handler.js";
export { addSseClient, closeAllSseClients, getSseClientCount } from "./sse.js";
export {
  startNavigation,
  endNavigation,
  getCurrentNavigationId,
} from "./navigation.js";
export {
  startRscRequest,
  endRscRequest,
  getActiveRscRequestId,
} from "./rsc-tracking.js";
export {
  debugComponent,
  debugCacheHit,
  debugCacheMiss,
  debugCacheInvalidate,
  getDebugApi,
  resetDebugApi,
} from "./debug-api.js";
export {
  getAdapter,
  detectNextVersion,
  type NextAdapter,
  type NextVersion,
} from "./adapter.js";
