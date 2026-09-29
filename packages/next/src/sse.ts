/**
 * Server-Sent Events endpoint for live event streaming.
 *
 * - Sends initial snapshot
 * - Streams new events
 * - Sends heartbeat
 * - Cleans up disconnected clients
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import { getCollector } from "@next-rsc-debug/core";

export interface SseClient {
  id: string;
  res: ServerResponse;
}

const HEARTBEAT_INTERVAL_MS = 15_000;

let nextClientId = 1;
const clients = new Map<string, SseClient>();

/**
 * Builds one SSE frame.
 *
 * Total by construction: it never throws. Callers therefore cannot confuse a
 * serialization failure with a dead connection, which previously caused a
 * single bad payload to silently unsubscribe a healthy client.
 */
export function formatSseEvent(event: string, data: unknown): string {
  let payload: string | undefined;
  try {
    payload = JSON.stringify(data);
  } catch (err) {
    // Should be unreachable now that `createEvent` sanitizes metadata, but a
    // hand-rolled collector or a future producer could still hand us a cycle.
    payload = JSON.stringify({
      serializationError:
        err instanceof Error ? err.message : "Failed to serialize event",
    });
  }
  if (payload === undefined) {
    // JSON.stringify(undefined) returns undefined, not a string.
    payload = "null";
  }
  // JSON.stringify escapes newlines inside strings, so a payload can never
  // inject a premature frame terminator.
  return `event: ${event}\ndata: ${payload}\n\n`;
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
  try {
    res.write(formatSseEvent("snapshot", { events, enabled: true }));
  } catch {
    // Headers are already flushed, so the client is committed. Close cleanly
    // instead of letting the exception escape and 500 the route.
    clients.delete(id);
    try {
      res.end();
    } catch {
      // Ignore.
    }
    return id;
  }

  // Subscribe to new events.
  const unsubscribe = collector.subscribe((event) => {
    try {
      res.write(formatSseEvent("event", event));
    } catch {
      // `formatSseEvent` is total, so a throw here really is a dead socket.
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
  for (const client of clients.values()) {
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
