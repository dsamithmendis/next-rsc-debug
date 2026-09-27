/**
 * Navigation tracking.
 *
 * Observes navigation events where reliably possible.
 * For v0.1, navigation tracking is inferred from fetch/RSC activity
 * rather than from browser navigation APIs.
 */

import {
  createEvent,
  createNavigationId,
  getCollector,
} from "@next-rsc-debug/core";

let currentNavigationId: string | null = null;

export function startNavigation(metadata?: Record<string, unknown>): string {
  const navId = createNavigationId();
  currentNavigationId = navId;
  const collector = getCollector();
  collector.push(
    createEvent({
      type: "navigation:start",
      requestId: navId,
      metadata: { ...metadata, observed: true },
    }),
  );
  return navId;
}

export function endNavigation(
  navId?: string,
  metadata?: Record<string, unknown>,
): void {
  const id = navId ?? currentNavigationId;
  if (!id) {
    return;
  }
  const collector = getCollector();
  collector.push(
    createEvent({
      type: "navigation:end",
      requestId: id,
      metadata: { ...metadata, observed: true },
    }),
  );
  if (currentNavigationId === id) {
    currentNavigationId = null;
  }
}

export function getCurrentNavigationId(): string | null {
  return currentNavigationId;
}
