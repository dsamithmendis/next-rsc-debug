"use client";

/**
 * Interactive filter controls for the DevTools dashboard.
 *
 * This is the only part of the former `Filters.tsx` that needs the client
 * boundary — the buttons hold `onClick` handlers. The option data and the
 * `filterEvents` predicate live in `../lib/filterOptions.ts`, which is
 * server-safe.
 */

import { FILTER_OPTIONS, type FilterType } from "../lib/filterOptions.js";

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
