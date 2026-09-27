/**
 * Debug route handler for /__next-rsc-debug/events
 *
 * GET:
 * - Normal JSON request returns { enabled, events }
 * - SSE request streams events live
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import { getCollector } from "@next-rsc-debug/core";
import { addSseClient, isSseRequest } from "./sse.js";

export function isDebugRequest(url: string): boolean {
  return url.includes("/__next-rsc-debug/events");
}

export function handleDebugEvents(
  req: IncomingMessage,
  res: ServerResponse,
): void {
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
