/**
 * Public API for @next-rsc-debug/devtools.
 *
 * This barrel deliberately carries NO `"use client"` directive. Previously it
 * did, which meant every non-component export below (`FILTER_OPTIONS`,
 * `filterEvents`) reached a Server Component as a *client reference* rather
 * than a real value — `FILTER_OPTIONS.map(...)` would have thrown.
 *
 * The boundary now lives on the individual modules that need it:
 *   - `DevTools`, `FilterControls`, `useSse`, `PanelBoundary` → "use client"
 *   - `Summary`, `Timeline`, `Warnings`, `FetchInspector` → server-renderable
 *
 * Re-exporting a client component from this server-safe module is the normal
 * pattern, so the single import path still works for both runtimes.
 */

export { DevTools, type DevToolsProps } from "./components/DevTools.js";
export { Timeline, type TimelineProps } from "./components/Timeline.js";
export {
  FetchInspector,
  type FetchInspectorProps,
} from "./components/FetchInspector.js";
export { Warnings, type WarningsProps } from "./components/Warnings.js";
export { Summary, type SummaryProps } from "./components/Summary.js";
export {
  FilterControls,
  type FilterControlsProps,
} from "./components/FilterControls.js";
export {
  PanelBoundary,
  type PanelBoundaryProps,
} from "./components/PanelBoundary.js";
export {
  filterEvents,
  FILTER_OPTIONS,
  type FilterType,
  type FilterOption,
} from "./lib/filterOptions.js";
export { useSse, type SseState } from "./hooks/useSse.js";
