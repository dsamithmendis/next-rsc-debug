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
} from "./events.js";

export {
  sanitizeUrl,
  stripSensitiveQueryParams,
  isSafeKey,
  sanitizeKey,
  sanitizeMetadata,
  type SanitizeUrlOptions,
  type SanitizeMetadataOptions,
} from "./sanitize.js";

export {
  RingBuffer,
  DEFAULT_MAX_EVENTS,
  type EventListener,
  type Unsubscribe,
  type RingBufferOptions,
} from "./ring-buffer.js";

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
} from "./analyzer.js";

export {
  getCollector,
  createCollector,
  setCollector,
  resetCollector,
  type Collector,
} from "./collector.js";
