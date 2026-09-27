/**
 * RSC request tracking.
 *
 * Tracks RSC activity only where reliably observable.
 * For v0.1, we observe RSC requests via fetch instrumentation
 * and route handler interception, but do NOT claim exact
 * per-component render timing.
 */

import { createEvent, createRequestId, getCollector } from "@next-rsc-debug/core";

export interface RscRequestOptions {
  route?: string;
  parentId?: string;
  metadata?: Record<string, unknown>;
}

let activeRscRequestId: string | null = null;

export function startRscRequest(options: RscRequestOptions = {}): string {
  const requestId = createRequestId();
  activeRscRequestId = requestId;
  const collector = getCollector();
  collector.push(
    createEvent({
      type: "rsc:start",
      requestId,
      parentId: options.parentId,
      metadata: {
        route: options.route,
        ...options.metadata,
        observed: true,
        confidence: "observed",
      },
    })
  );
  return requestId;
}

export function endRscRequest(
  requestId?: string,
  metadata?: Record<string, unknown>
): void {
  const id = requestId ?? activeRscRequestId;
  if (!id) {
    return;
  }
  const collector = getCollector();
  collector.push(
    createEvent({
      type: "rsc:end",
      requestId: id,
      metadata: { ...metadata, observed: true, confidence: "observed" },
    })
  );
  if (activeRscRequestId === id) {
    activeRscRequestId = null;
  }
}

export function getActiveRscRequestId(): string | null {
  return activeRscRequestId;
}