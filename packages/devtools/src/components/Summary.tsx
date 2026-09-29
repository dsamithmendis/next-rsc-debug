/**
 * Summary cards for the DevTools dashboard.
 *
 * No `"use client"` directive: this component only reads serializable props
 * and uses `useMemo` as a render-time optimization, so it can be rendered by a
 * Server Component. `DevTools` (a client module) imports it just fine.
 */

import { useMemo } from "react";
import type { DebugEvent, Warning } from "@next-rsc-debug/core";
import { analyzeEvents } from "@next-rsc-debug/core";

export interface SummaryProps {
  events: DebugEvent[];
  threshold: number;
  /**
   * Pre-computed warnings from `analyzeEvents`. Supply this when several
   * panels share one analysis so the (O(n), URL-normalizing) pass is not
   * repeated. When omitted the component computes its own.
   */
  warnings?: Warning[];
}

export function Summary({ events, threshold, warnings }: SummaryProps) {
  const resolvedWarnings = useMemo(
    () =>
      warnings ?? analyzeEvents(events, { slowThreshold: threshold }).warnings,
    [warnings, events, threshold],
  );

  const stats = useMemo(() => {
    const fetches = events.filter(
      (e) => e.type === "fetch:start" || e.type === "fetch:end",
    ).length;
    const slow = resolvedWarnings.filter(
      (w) => w.type === "slow-request",
    ).length;
    const dupes = resolvedWarnings.filter(
      (w) => w.type === "duplicate-request",
    ).length;
    const errors = events.filter((e) => e.type === "error").length;
    return { total: events.length, fetches, slow, dupes, errors };
  }, [events, resolvedWarnings]);

  const cards = [
    { label: "Events", value: stats.total, color: "#60a5fa" },
    { label: "Fetches", value: stats.fetches, color: "#34d399" },
    { label: "Slow", value: stats.slow, color: "#fbbf24" },
    { label: "Duplicates", value: stats.dupes, color: "#f87171" },
    { label: "Errors", value: stats.errors, color: "#ef4444" },
  ];

  return (
    <div className="nrpd-summary">
      {cards.map((card) => (
        <div key={card.label} className="nrpd-summary-card">
          <span
            className="nrpd-summary-dot"
            style={{ background: card.color }}
          />
          <span className="nrpd-summary-value">{card.value}</span>
          <span className="nrpd-summary-label">{card.label}</span>
        </div>
      ))}
    </div>
  );
}
