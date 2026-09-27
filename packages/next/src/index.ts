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
} from "./server";
export {
  wrapFetch,
  unwrapFetch,
  isFetchInstrumented,
} from "./fetch-instrument";
export { handleDebugEvents, isDebugRequest } from "./route-handler";
export { addSseClient, closeAllSseClients, getSseClientCount } from "./sse";
export {
  startNavigation,
  endNavigation,
  getCurrentNavigationId,
} from "./navigation";
export {
  startRscRequest,
  endRscRequest,
  getActiveRscRequestId,
} from "./rsc-tracking";
export {
  debugComponent,
  debugCacheHit,
  debugCacheMiss,
  debugCacheInvalidate,
  getDebugApi,
  resetDebugApi,
} from "./debug-api";
export {
  getAdapter,
  detectNextVersion,
  type NextAdapter,
  type NextVersion,
} from "./adapter";
