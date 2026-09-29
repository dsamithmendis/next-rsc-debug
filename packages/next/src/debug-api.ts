/**
 * Debug API surface for Next RSC Debug.
 *
 * Exposes helpers for creating events, fetching the collector,
 * and explicit instrumentation hooks.
 */

import {
  createEvent,
  createRequestId,
  createNavigationId,
  getCollector,
  sanitizeKey,
  type DebugEvent,
  type DebugEventType,
} from "@next-rsc-debug/core";

export interface DebugApi {
  event(type: DebugEventType, metadata?: Record<string, unknown>): DebugEvent;
  requestId(): string;
  navigationId(): string;
  collector: ReturnType<typeof getCollector>;
}

let apiInstance: DebugApi | null = null;

export function getDebugApi(): DebugApi {
  if (!apiInstance) {
    const collector = getCollector();
    apiInstance = {
      event: (type, metadata) => {
        const event = createEvent({ type, metadata });
        collector.push(event);
        return event;
      },
      requestId: createRequestId,
      navigationId: createNavigationId,
      collector,
    };
  }
  return apiInstance;
}

export function resetDebugApi(): void {
  apiInstance = null;
}

export function debugComponent<T>(
  name: string,
  fn: () => Promise<T> | T,
): Promise<T> {
  const api = getDebugApi();
  const start = createEvent({
    type: "rsc:start",
    metadata: { component: name, observed: true },
  });
  api.collector.push(start);

  const result = fn();

  if (result instanceof Promise) {
    return result.then(
      (value) => {
        const end = createEvent({
          type: "rsc:end",
          parentId: start.id,
          duration: Date.now() - start.timestamp,
          metadata: { component: name, observed: true },
        });
        api.collector.push(end);
        return value;
      },
      (error) => {
        const end = createEvent({
          type: "rsc:end",
          parentId: start.id,
          duration: Date.now() - start.timestamp,
          metadata: { component: name, observed: true, error: true },
        });
        api.collector.push(end);
        throw error;
      },
    );
  }

  const end = createEvent({
    type: "rsc:end",
    parentId: start.id,
    duration: Date.now() - start.timestamp,
    metadata: { component: name, observed: true },
  });
  api.collector.push(end);
  return Promise.resolve(result);
}

export function debugCacheHit(
  key: string,
  metadata?: Record<string, unknown>,
): void {
  const api = getDebugApi();
  api.collector.push(
    createEvent({
      type: "cache:hit",
      // Cache keys routinely embed the thing being cached — `user:alice@…` —
      // and they are broadcast to every connected browser, so redact the
      // identifying parts before the event is stored.
      metadata: { key: sanitizeKey(key), ...metadata, observed: true },
    }),
  );
}

export function debugCacheMiss(
  key: string,
  metadata?: Record<string, unknown>,
): void {
  const api = getDebugApi();
  api.collector.push(
    createEvent({
      type: "cache:miss",
      metadata: { key: sanitizeKey(key), ...metadata, observed: true },
    }),
  );
}

export function debugCacheInvalidate(
  key: string,
  metadata?: Record<string, unknown>,
): void {
  const api = getDebugApi();
  api.collector.push(
    createEvent({
      type: "cache:invalidate",
      metadata: { key: sanitizeKey(key), ...metadata, observed: true },
    }),
  );
}
