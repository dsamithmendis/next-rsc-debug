"use client";

/**
 * Fetch inspector component.
 */

import { useMemo } from "react";
import type { DebugEvent } from "@next-rsc-debug/core";

export interface FetchInspectorProps {
  event: DebugEvent | null;
}

interface InspectorRow {
  label: string;
  value: string;
}

export function FetchInspector({ event }: FetchInspectorProps) {
  const metadata = (event?.metadata ?? {}) as Record<string, unknown>;

  const rows = useMemo((): InspectorRow[] => {
    if (!event) return [];
    return [
      { label: "Method", value: String(metadata.method ?? "—") },
      { label: "URL", value: String(metadata.url ?? "—") },
      { label: "Status", value: String(metadata.status ?? "—") },
      {
        label: "Duration",
        value: metadata.duration !== undefined ? `${metadata.duration}ms` : "—",
      },
      { label: "Timestamp", value: new Date(event.timestamp).toISOString() },
      { label: "Request ID", value: String(event.requestId ?? "—") },
      { label: "Parent ID", value: String(event.parentId ?? "—") },
      {
        label: "Content length",
        value:
          metadata.contentLength !== undefined
            ? `${metadata.contentLength} bytes`
            : "—",
      },
      {
        label: "Confidence",
        value: String(metadata.confidence ?? "observed"),
      },
    ];
  }, [event, metadata]);

  if (!event) {
    return (
      <div className="nrpd-empty">
        <span>Select an event to inspect.</span>
      </div>
    );
  }

  const warnings = Array.isArray(metadata.warnings)
    ? (metadata.warnings as Array<string | { message?: string }>)
    : [];

  return (
    <div className="nrpd-inspector">
      <table className="nrpd-inspector-table">
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="nrpd-inspector-label">{row.label}</td>
              <td className="nrpd-inspector-value">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {warnings.length > 0 && (
        <div className="nrpd-warnings">
          <h4>Warnings</h4>
          <ul>
            {warnings.map((w, i) => (
              <li key={i}>{typeof w === "string" ? w : (w.message ?? "")}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
