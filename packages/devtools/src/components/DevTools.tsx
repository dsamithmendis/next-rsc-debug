"use client";

/**
 * Main DevTools dashboard.
 */

import { useState, useMemo } from "react";
import { analyzeEvents } from "@next-rsc-debug/core";
import { useSse } from "../hooks/useSse.js";
import { Summary } from "./Summary.js";
import { Timeline } from "./Timeline.js";
import { FetchInspector } from "./FetchInspector.js";
import { Warnings } from "./Warnings.js";
import { FilterControls } from "./FilterControls.js";
import { PanelBoundary } from "./PanelBoundary.js";
import { filterEvents, type FilterType } from "../lib/filterOptions.js";

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

  // Analyzed once here and shared with both panels. `Summary` and `Warnings`
  // would otherwise each run the same O(n) pass with identical arguments on
  // every render.
  //
  // These three derivations run in the orchestrator's body, which sits *above*
  // every panel boundary — an exception here would take down the whole
  // dashboard regardless of the boundaries below. They read untrusted event
  // payloads, so they degrade instead of throwing: a bad event costs you that
  // panel's detail, not the whole UI.
  const warnings = useMemo(() => {
    try {
      return analyzeEvents(events, { slowThreshold: threshold }).warnings;
    } catch {
      return [];
    }
  }, [events, threshold]);

  const filtered = useMemo(() => {
    try {
      return filterEvents(events, filter, threshold);
    } catch {
      return events;
    }
  }, [events, filter, threshold]);

  const selectedEvent = useMemo(() => {
    try {
      return filtered.find((e) => e?.id === selectedId) ?? null;
    } catch {
      return null;
    }
  }, [filtered, selectedId]);

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

      <PanelBoundary
        label="Summary"
        resetKey={`summary:${events.length}:${threshold}`}
      >
        <Summary events={events} threshold={threshold} warnings={warnings} />
      </PanelBoundary>

      <PanelBoundary
        label="Filters"
        resetKey={`filters:${filter}:${threshold}`}
      >
        <FilterControls
          activeFilter={filter}
          onFilterChange={setFilter}
          threshold={threshold}
          onThresholdChange={setThreshold}
        />
      </PanelBoundary>

      <div className="nrpd-main">
        <div className="nrpd-panel nrpd-panel-timeline">
          <h2>Timeline</h2>
          <PanelBoundary
            label="Timeline"
            resetKey={`timeline:${filtered.length}:${selectedId ?? ""}`}
          >
            <Timeline
              events={filtered}
              selectedId={selectedId}
              onSelect={(event) => setSelectedId(event.id)}
            />
          </PanelBoundary>
        </div>

        <div className="nrpd-panel nrpd-panel-inspector">
          <h2>Event details</h2>
          <PanelBoundary
            label="Event details"
            resetKey={`inspector:${selectedEvent?.id ?? "none"}`}
          >
            <FetchInspector event={selectedEvent} />
          </PanelBoundary>
        </div>
      </div>

      <div className="nrpd-panel nrpd-panel-warnings">
        <PanelBoundary
          label="Warnings"
          resetKey={`warnings:${events.length}:${threshold}`}
        >
          <Warnings events={events} threshold={threshold} warnings={warnings} />
        </PanelBoundary>
      </div>
    </div>
  );
}

export default DevTools;
