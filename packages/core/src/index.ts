/**
 * Public API for @next-rsc-debug/core.
 */

export {
  createEvent,
  createEventId,
  createRequestId,
  createNavigationId,
  type DebugEvent,
  type DebugEventType,
  type CreateEventOptions,
} from "./events";

export { sanitizeUrl, stripSensitiveQueryParams, isSafeKey } from "./sanitize";

export {
  RingBuffer,
  type EventListener,
  type Unsubscribe,
  type RingBufferOptions,
} from "./ring-buffer";

export {
  analyzeEvents,
  type Warning,
  type WarningType,
  type WarningSeverity,
  type AnalyzeOptions,
  normalizeFetchUrl,
  isFetchEventType,
  isNavigationEventType,
  isRscEventType,
  isCacheEventType,
  isActionEventType,
  isErrorEventType,
} from "./analyzer";

export {
  getCollector,
  createCollector,
  setCollector,
  resetCollector,
  type Collector,
} from "./collector";
