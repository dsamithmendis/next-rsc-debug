/**
 * Warnings panel.
 *
 * No `"use client"` directive — see the note in `Summary.tsx`.
 */

import { useMemo } from "react";
import type { DebugEvent, Warning } from "@next-rsc-debug/core";
import { analyzeEvents } from "@next-rsc-debug/core";

export interface WarningsProps {
  events: DebugEvent[];
  threshold?: number;
  /**
   * Pre-computed warnings from `analyzeEvents`. Supply this to share one
   * analysis across panels; when omitted the component computes its own.
   */
  warnings?: Warning[];
}

export function Warnings({ events, threshold, warnings }: WarningsProps) {
  const resolvedWarnings = useMemo(
    () =>
      warnings ?? analyzeEvents(events, { slowThreshold: threshold }).warnings,
    [warnings, events, threshold],
  );

  if (resolvedWarnings.length === 0) {
    return (
      <div className="nrpd-panel-body">
        <h2>Warnings</h2>
        <div className="nrpd-empty">
          <span>No warnings detected.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="nrpd-panel-body">
      <h2>Warnings ({resolvedWarnings.length})</h2>
      <ul className="nrpd-warning-list">
        {resolvedWarnings.map((w: Warning) => (
          <li key={w.id} className={`nrpd-warning nrpd-warning-${w.type}`}>
            <span className="nrpd-warning-type">{w.type}</span>
            <span className="nrpd-warning-message">{w.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
