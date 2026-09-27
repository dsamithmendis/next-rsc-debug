/**
 * Analyzer primitives: warning detection.
 *
 * Warnings:
 * - slow-request: duration >= threshold (default 500ms)
 * - duplicate-request: normalized URL groups
 * - error: error events
 */

import type { DebugEvent, DebugEventType } from "./events";
import { sanitizeUrl } from "./sanitize";

export type WarningSeverity = "info" | "warning";

export type WarningType = "slow-request" | "duplicate-request" | "error";

export interface Warning {
  id: string;
  type: WarningType;
  severity: WarningSeverity;
  eventIds: string[];
  message: string;
  details?: Record<string, unknown>;
}

export interface AnalyzeOptions {
  slowThreshold?: number;
}

const DEFAULT_SLOW_THRESHOLD = 500;

export function analyzeEvents(
  events: DebugEvent[],
  options: AnalyzeOptions = {},
): { warnings: Warning[] } {
  const slowThreshold = options.slowThreshold ?? DEFAULT_SLOW_THRESHOLD;
  const warnings: Warning[] = [];

  // Slow request detection: events with duration >= threshold.
  for (const event of events) {
    if (event.duration !== undefined && event.duration >= slowThreshold) {
      warnings.push({
        id: `warn_slow_${event.id}`,
        type: "slow-request",
        severity: "warning",
        eventIds: [event.id],
        message: `Slow operation detected: ${event.duration}ms (threshold: ${slowThreshold}ms)`,
        details: {
          duration: event.duration,
          threshold: slowThreshold,
          type: event.type,
          requestId: event.requestId,
        },
      });
    }
  }

  // Duplicate detection: group fetch events by normalized URL.
  const fetchGroups = new Map<string, DebugEvent[]>();
  for (const event of events) {
    if (event.type === "fetch:end" && event.metadata?.url) {
      const url = sanitizeUrl(String(event.metadata.url));
      const group = fetchGroups.get(url);
      if (group) {
        group.push(event);
      } else {
        fetchGroups.set(url, [event]);
      }
    }
  }

  for (const [url, group] of fetchGroups) {
    if (group.length > 1) {
      warnings.push({
        id: `warn_dup_${url.replace(/[^a-zA-Z0-9]/g, "_")}`,
        type: "duplicate-request",
        severity: "warning",
        eventIds: group.map((e) => e.id),
        message: `Duplicate request detected: ${url} (${group.length} times)`,
        details: {
          url,
          count: group.length,
          requestIds: group
            .map((e) => e.requestId)
            .filter((id): id is string => id !== undefined),
        },
      });
    }
  }

  // Error detection.
  for (const event of events) {
    if (event.type === "error") {
      warnings.push({
        id: `warn_error_${event.id}`,
        type: "error",
        severity: "warning",
        eventIds: [event.id],
        message: String(event.metadata?.message ?? "Unknown error"),
        details: {
          requestId: event.requestId,
          metadata: event.metadata,
        },
      });
    }
  }

  return { warnings };
}

export function normalizeFetchUrl(event: DebugEvent): string | undefined {
  if (event.type !== "fetch:end" || !event.metadata?.url) {
    return undefined;
  }
  return sanitizeUrl(String(event.metadata.url));
}

export function isFetchEventType(type: DebugEventType): boolean {
  return type === "fetch:start" || type === "fetch:end";
}

export function isNavigationEventType(type: DebugEventType): boolean {
  return type === "navigation:start" || type === "navigation:end";
}

export function isRscEventType(type: DebugEventType): boolean {
  return type === "rsc:start" || type === "rsc:end";
}

export function isCacheEventType(type: DebugEventType): boolean {
  return (
    type === "cache:hit" || type === "cache:miss" || type === "cache:invalidate"
  );
}

export function isActionEventType(type: DebugEventType): boolean {
  return type === "action:start" || type === "action:end";
}

export function isErrorEventType(type: DebugEventType): boolean {
  return type === "error";
}
