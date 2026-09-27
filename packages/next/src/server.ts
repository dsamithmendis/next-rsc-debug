/**
 * Public API for next-rsc-debug/server.
 */

export {
  register,
  unregister,
  isDebuggingEnabled,
  type RegisterOptions,
} from "./instrumentation.js";

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
