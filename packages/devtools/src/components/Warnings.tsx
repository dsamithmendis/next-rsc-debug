"use client";

/**
 * Warnings panel.
 */

import { useMemo } from "react";
import type { DebugEvent, Warning } from "@next-rsc-debug/core";
import { analyzeEvents } from "@next-rsc-debug/core";

export interface WarningsProps {
  events: DebugEvent[];
  threshold?: number;
}

export function Warnings({ events, threshold }: WarningsProps) {
  const { warnings } = useMemo(
    () => analyzeEvents(events, { slowThreshold: threshold }),
    [events, threshold],
  );

  if (warnings.length === 0) {
    return (
      <div className="nrpd-empty">
        <span>No warnings detected.</span>
      </div>
    );
  }

  return (
    <div className="nrpd-warnings">
      <h3>Warnings ({warnings.length})</h3>
      <ul className="nrpd-warning-list">
        {warnings.map((w: Warning) => (
          <li key={w.id} className={`nrpd-warning nrpd-warning-${w.type}`}>
            <span className="nrpd-warning-type">{w.type}</span>
            <span className="nrpd-warning-message">{w.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
