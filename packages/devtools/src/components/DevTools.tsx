"use client";

/**
 * Main DevTools dashboard.
 */

import { useState, useMemo } from "react";
import { useSse } from "../hooks/useSse.js";
import { Summary } from "./Summary.js";
import { Timeline } from "./Timeline.js";
import { FetchInspector } from "./FetchInspector.js";
import { Warnings } from "./Warnings.js";
import { FilterControls, filterEvents, type FilterType } from "./Filters.js";

export interface DevToolsProps {
  url?: string;
  defaultThreshold?: number;
}

export function DevTools({
  url = "/__next-rsc-debug/events",
  defaultThreshold = 500,
}: DevToolsProps) {
  const { connected, events, error } = useSse(url);
  const [filter, setFilter] = useState<FilterType>("all");
  const [threshold, setThreshold] = useState(defaultThreshold);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const filtered = useMemo(
    () => filterEvents(events, filter, threshold),
    [events, filter, threshold],
  );

  const selectedEvent = useMemo(
    () => filtered.find((e) => e.id === selectedId) ?? null,
    [filtered, selectedId],
  );

  return (
    <div className="nrpd-dashboard">
      <header className="nrpd-header">
        <h1>Next RSC Debug</h1>
        <span
          className={`nrpd-connection ${connected ? "connected" : "disconnected"}`}
        >
          {connected ? "● Connected" : "○ Disconnected"}
        </span>
        {error && <span className="nrpd-error">{error}</span>}
      </header>

      <Summary events={events} threshold={threshold} />

      <FilterControls
        activeFilter={filter}
        onFilterChange={setFilter}
        threshold={threshold}
        onThresholdChange={setThreshold}
      />

      <div className="nrpd-main">
        <div className="nrpd-panel nrpd-panel-timeline">
          <h2>Timeline</h2>
          <Timeline
            events={filtered}
            selectedId={selectedId}
            onSelect={(event) => setSelectedId(event.id)}
          />
        </div>

        <div className="nrpd-panel nrpd-panel-inspector">
          <h2>Event details</h2>
          <FetchInspector event={selectedEvent} />
        </div>
      </div>

      <div className="nrpd-panel nrpd-panel-warnings">
        <Warnings events={events} threshold={threshold} />
      </div>
    </div>
  );
}

export default DevTools;
