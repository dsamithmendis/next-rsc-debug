/**
 * Public API for next-rsc-debug/server.
 */

export {
  register,
  unregister,
  isDebuggingEnabled,
  type RegisterOptions,
} from "./instrumentation";

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
