"use client";

/**
 * SSE client hook for live event streaming.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { DebugEvent } from "@next-rsc-debug/core";

export interface SseState {
  connected: boolean;
  events: DebugEvent[];
  error: string | null;
}

export function useSse(url: string): SseState {
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<DebugEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const eventsRef = useRef<DebugEvent[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let es: EventSource;
    try {
      es = new EventSource(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect");
      return;
    }

    esRef.current = es;

    es.onopen = () => {
      setConnected(true);
      setError(null);
    };

    es.onerror = () => {
      setConnected(false);
      setError("Connection lost");
    };

    es.addEventListener("snapshot", (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.events) {
          eventsRef.current = data.events;
          setEvents(data.events);
        }
      } catch {
        // Ignore parse errors.
      }
    });

    es.addEventListener("event", (e: MessageEvent) => {
      try {
        const event: DebugEvent = JSON.parse(e.data);
        eventsRef.current = [...eventsRef.current, event];
        setEvents(eventsRef.current);
      } catch {
        // Ignore parse errors.
      }
    });

    es.addEventListener("heartbeat", () => {
      // Heartbeat received — connection is alive.
    });

    return () => {
      es.close();
      setConnected(false);
    };
  }, [url]);

  return { connected, events, error };
}
