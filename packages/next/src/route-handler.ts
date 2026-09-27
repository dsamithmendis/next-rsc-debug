/**
 * Debug route handler for /__next-rsc-debug/events
 *
 * GET:
 * - Normal JSON request returns { enabled, events }
 * - SSE request streams events live
 */

import { Readable } from "node:stream";
import { getCollector } from "@next-rsc-debug/core";
import { addSseClient, isSseRequest } from "./sse";

export function isDebugRequest(url: string): boolean {
  return url.includes("/__next-rsc-debug/events");
}

export function handleDebugEvents(req: any, res: any): void {
  if (req.method !== "GET") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ error: "Method not allowed", method: req.method }),
    );
    return;
  }

  if (isSseRequest(req)) {
    addSseClient(res);
    return;
  }

  const collector = getCollector();
  const events = collector.list();
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ enabled: true, events }));
}
