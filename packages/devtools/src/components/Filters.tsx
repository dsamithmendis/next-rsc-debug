"use client";

/**
 * Filter controls for the DevTools dashboard.
 */

import { useMemo } from "react";
import type { DebugEvent, DebugEventType } from "@next-rsc-debug/core";

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
  threshold: number
): DebugEvent[] {
  if (filter === "all") {
    return events;
  }

  return events.filter((event) => {
    switch (filter) {
      case "navigation":
        return (
          event.type === "navigation:start" ||
          event.type === "navigation:end"
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
        return (
          event.type === "action:start" || event.type === "action:end"
        );
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

export interface FilterControlsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  threshold: number;
  onThresholdChange: (threshold: number) => void;
}

export function FilterControls({
  activeFilter,
  onFilterChange,
  threshold,
  onThresholdChange,
}: FilterControlsProps) {
  return (
    <div className="nrpd-filters">
      <div className="nrpd-filter-group">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            className={`nrpd-filter-btn ${activeFilter === opt.id ? "active" : ""}`}
            onClick={() => onFilterChange(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="nrpd-threshold">
        <label>
          Slow threshold:
          <input
            type="number"
            value={threshold}
            onChange={(e) =>
              onThresholdChange(Number.parseInt(e.target.value, 10) || 500)
            }
            min={0}
            step={50}
          />
          <span>ms</span>
        </label>
      </div>
    </div>
  );
}