/**
 * Event timeline component.
 *
 * No `"use client"` directive: it renders from serializable props. `onSelect`
 * is optional, so a Server Component may render it read-only; `DevTools`
 * supplies the handler from the client.
 */

import { useMemo } from "react";
import type { DebugEvent } from "@next-rsc-debug/core";
import {
  isNavigationEventType,
  isRscEventType,
  isFetchEventType,
  isCacheEventType,
  isActionEventType,
  isErrorEventType,
} from "@next-rsc-debug/core";

export interface TimelineProps {
  events: DebugEvent[];
  selectedId?: string;
  onSelect?: (event: DebugEvent) => void;
  /**
   * Maximum rows rendered at once. The event array is bounded (see `useSse`),
   * but the DOM is not: a few thousand rows is enough to make the panel
   * unusable, so only the most recent are drawn and the rest are summarised.
   */
  maxItems?: number;
}

const DEFAULT_MAX_ITEMS = 200;

function getEventIcon(type: DebugEvent["type"]): string {
  if (isNavigationEventType(type)) return "🧭";
  if (isRscEventType(type)) return "📦";
  if (isFetchEventType(type)) return "🌐";
  if (isCacheEventType(type)) return "💾";
  if (isActionEventType(type)) return "⚡";
  if (isErrorEventType(type)) return "❌";
  return "•";
}

function getEventLabel(event: DebugEvent): string {
  switch (event.type) {
    case "navigation:start":
      return `Navigation start`;
    case "navigation:end":
      return `Navigation end`;
    case "rsc:start":
      return `RSC request${event.metadata?.route ? ` → ${event.metadata.route}` : ""}`;
    case "rsc:end":
      return `RSC response${event.metadata?.route ? ` → ${event.metadata.route}` : ""}`;
    case "fetch:start":
      return `fetch ${event.metadata?.method ?? "GET"} ${event.metadata?.url ?? ""}`;
    case "fetch:end":
      return `fetch ${event.metadata?.method ?? "GET"} ${event.metadata?.url ?? ""} ${event.metadata?.status ?? ""}`;
    case "cache:hit":
      return `Cache HIT: ${event.metadata?.key ?? ""}`;
    case "cache:miss":
      return `Cache MISS: ${event.metadata?.key ?? ""}`;
    case "cache:invalidate":
      return `Cache INVALIDATE: ${event.metadata?.key ?? ""}`;
    case "action:start":
      return `Action start: ${event.metadata?.name ?? ""}`;
    case "action:end":
      return `Action end: ${event.metadata?.name ?? ""}`;
    case "error":
      return `Error: ${event.metadata?.message ?? ""}`;
    default:
      return event.type;
  }
}

export function Timeline({
  events,
  selectedId,
  onSelect,
  maxItems = DEFAULT_MAX_ITEMS,
}: TimelineProps) {
  const sorted = useMemo(
    () => [...events].sort((a, b) => a.timestamp - b.timestamp),
    [events],
  );

  if (sorted.length === 0) {
    return (
      <div className="nrpd-empty">
        <span>No events yet.</span>
      </div>
    );
  }

  // Keep the newest rows: this is a live tail, and the most recent activity is
  // what a developer is looking at.
  const visible = sorted.slice(-maxItems);
  const hiddenCount = sorted.length - visible.length;

  return (
    <div className="nrpd-timeline">
      {hiddenCount > 0 && (
        <div className="nrpd-timeline-truncated">
          Showing the {visible.length} most recent of {sorted.length} events (
          {hiddenCount} older not rendered).
        </div>
      )}
      {visible.map((event) => {
        const isSelected = event.id === selectedId;
        const duration =
          event.duration !== undefined ? ` (${event.duration}ms)` : "";
        return (
          <div
            key={event.id}
            className={`nrpd-timeline-item ${isSelected ? "selected" : ""}`}
            onClick={() => onSelect?.(event)}
          >
            <span className="nrpd-timeline-icon">
              {getEventIcon(event.type)}
            </span>
            <span className="nrpd-timeline-label">
              {getEventLabel(event)}
              {duration}
            </span>
            <span className="nrpd-timestamp">
              {new Date(event.timestamp).toLocaleTimeString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
