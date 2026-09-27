/**
 * Next.js App Router route handler for /__next-rsc-debug/events.
 *
 * Usage:
 *   app/api/debug-events/route.ts
 *   import { GET } from "next-rsc-debug/route";
 */

import { NextResponse } from "next/server";
import { getCollector } from "@next-rsc-debug/core";

const HEARTBEAT_INTERVAL_MS = 15_000;

function formatSseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export function GET(request: Request): Response {
  const accept = request.headers.get("accept") ?? "";
  const isSse = accept.includes("text/event-stream");

  const collector = getCollector();
  const events = collector.list();

  if (!isSse) {
    return NextResponse.json({ enabled: true, events });
  }

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        new TextEncoder().encode(
          formatSseEvent("snapshot", { events, enabled: true }),
        ),
      );

      const unsubscribe = collector.subscribe((event) => {
        try {
          controller.enqueue(
            new TextEncoder().encode(formatSseEvent("event", event)),
          );
        } catch {
          unsubscribe?.();
          controller.close();
        }
      });

      const heartbeatTimer = setInterval(() => {
        try {
          controller.enqueue(
            new TextEncoder().encode(
              formatSseEvent("heartbeat", { timestamp: Date.now() }),
            ),
          );
        } catch {
          clearInterval(heartbeatTimer);
          unsubscribe?.();
          controller.close();
        }
      }, HEARTBEAT_INTERVAL_MS);

      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeatTimer);
        unsubscribe?.();
        try {
          controller.close();
        } catch {
          // Already closed.
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
