/**
 * Server-Sent Events endpoint for live event streaming.
 *
 * - Sends initial snapshot
 * - Streams new events
 * - Sends heartbeat
 * - Cleans up disconnected clients
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import { getCollector, type DebugEvent } from "@next-rsc-debug/core";

export interface SseClient {
  id: string;
  res: ServerResponse;
}

const HEARTBEAT_INTERVAL_MS = 15_000;

let nextClientId = 1;
const clients = new Map<string, SseClient>();

function formatSseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export function addSseClient(res: ServerResponse): string {
  const id = `sse_${nextClientId++}`;
  const client: SseClient = { id, res };
  clients.set(id, client);

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  // Send initial snapshot.
  const collector = getCollector();
  const events = collector.list();
  res.write(formatSseEvent("snapshot", { events, enabled: true }));

  // Subscribe to new events.
  const unsubscribe = collector.subscribe((event) => {
    try {
      res.write(formatSseEvent("event", event));
    } catch {
      // Client disconnected; clean up.
      unsubscribe();
      removeSseClient(id);
    }
  });

  // Heartbeat.
  const heartbeatTimer = setInterval(() => {
    try {
      res.write(formatSseEvent("heartbeat", { timestamp: Date.now() }));
    } catch {
      clearInterval(heartbeatTimer);
      unsubscribe();
      removeSseClient(id);
    }
  }, HEARTBEAT_INTERVAL_MS);

  // Cleanup on close.
  res.on("close", () => {
    clearInterval(heartbeatTimer);
    unsubscribe();
    removeSseClient(id);
  });

  return id;
}

export function removeSseClient(id: string): void {
  clients.delete(id);
}

export function getSseClientCount(): number {
  return clients.size;
}

export function closeAllSseClients(): void {
  for (const [id, client] of clients) {
    try {
      client.res.end();
    } catch {
      // Ignore.
    }
  }
  clients.clear();
}

export function isSseRequest(req: IncomingMessage): boolean {
  const accept = req.headers.accept ?? "";
  return accept.includes("text/event-stream");
}