/**
 * Filter definitions and the pure event-filtering predicate.
 *
 * Deliberately NOT a `"use client"` module: these are plain data and a pure
 * function, so a Server Component can import and call them directly. Keeping
 * them out of the client boundary is what lets `index.ts` re-export them as
 * real values instead of client references.
 */

import type { DebugEvent } from "@next-rsc-debug/core";

export type FilterType =
  | "all"
  | "navigation"
  | "rsc"
  | "fetch"
  | "cache"
  | "action"
  | "error"
  | "slow"
  | "errors";

export interface FilterOption {
  id: FilterType;
  label: string;
}

export const FILTER_OPTIONS: FilterOption[] = [
  { id: "all", label: "All" },
  { id: "navigation", label: "Navigation" },
  { id: "rsc", label: "RSC" },
  { id: "fetch", label: "Fetch" },
  { id: "cache", label: "Cache" },
  { id: "action", label: "Actions" },
  { id: "error", label: "Errors" },
  { id: "slow", label: "Slow only" },
  { id: "errors", label: "Errors only" },
];

export function filterEvents(
  events: DebugEvent[],
  filter: FilterType,
  threshold: number,
): DebugEvent[] {
  if (filter === "all") {
    return events;
  }

  return events.filter((event) => {
    switch (filter) {
      case "navigation":
        return (
          event.type === "navigation:start" || event.type === "navigation:end"
        );
      case "rsc":
        return event.type === "rsc:start" || event.type === "rsc:end";
      case "fetch":
        return event.type === "fetch:start" || event.type === "fetch:end";
      case "cache":
        return (
          event.type === "cache:hit" ||
          event.type === "cache:miss" ||
          event.type === "cache:invalidate"
        );
      case "action":
        return event.type === "action:start" || event.type === "action:end";
      case "error":
        return event.type === "error";
      case "slow":
        return (event.duration ?? 0) >= threshold;
      case "errors":
        return event.type === "error";
      default:
        return true;
    }
  });
}
