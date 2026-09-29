"use client";

/**
 * SSE client hook for live event streaming.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import type { DebugEvent } from "@next-rsc-debug/core";
import { DEFAULT_MAX_EVENTS } from "@next-rsc-debug/core";

export interface SseState {
  connected: boolean;
  events: DebugEvent[];
  error: string | null;
}

export interface UseSseOptions {
  /**
   * Upper bound on events retained in the browser. The server already evicts
   * beyond its own ring buffer, but the client would otherwise accumulate every
   * streamed event for the lifetime of the page. Defaults to the same limit so
   * a snapshot is never truncated on arrival.
   */
  maxEvents?: number;
}

export function useSse(url: string, options: UseSseOptions = {}): SseState {
  const maxEvents = options.maxEvents ?? DEFAULT_MAX_EVENTS;
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<DebugEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const eventsRef = useRef<DebugEvent[]>([]);
  const pendingRef = useRef<DebugEvent[]>([]);
  const cancelRef = useRef<(() => void) | null>(null);

  // Keep the latest limit in a ref so changing it does not tear down and
  // re-establish the EventSource connection.
  const maxEventsRef = useRef(maxEvents);
  maxEventsRef.current = maxEvents;

  /**
   * SSE delivers events one message at a time. Committing each one to state
   * immediately gives every message a fresh array identity, which invalidates
   * every downstream `useMemo` and re-renders the whole dashboard. Buffering
   * pending events and flushing once per frame collapses a burst into a single
   * render, keeping the analysis cost linear in the number of events rather
   * than quadratic.
   */
  const flush = useCallback(() => {
    cancelRef.current = null;
    if (pendingRef.current.length === 0) {
      return;
    }
    const merged = [...eventsRef.current, ...pendingRef.current];
    // Drop the oldest rather than refusing new events: for a live tail, the
    // most recent activity is the useful part.
    eventsRef.current =
      merged.length > maxEventsRef.current
        ? merged.slice(merged.length - maxEventsRef.current)
        : merged;
    pendingRef.current = [];
    setEvents(eventsRef.current);
  }, []);

  const scheduleFlush = useCallback(() => {
    if (cancelRef.current !== null) {
      return;
    }
    if (typeof requestAnimationFrame === "function") {
      const handle = requestAnimationFrame(flush);
      cancelRef.current = () => cancelAnimationFrame(handle);
    } else {
      const handle = setTimeout(flush, 0);
      cancelRef.current = () => clearTimeout(handle);
    }
  }, [flush]);

  const cancelFlush = useCallback(() => {
    cancelRef.current?.();
    cancelRef.current = null;
  }, []);

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
          // A snapshot is authoritative and replaces buffered history, so any
          // queued events are dropped rather than appended out of order.
          cancelFlush();
          pendingRef.current = [];
          eventsRef.current = data.events.slice(-maxEventsRef.current);
          setEvents(eventsRef.current);
        }
      } catch {
        // Ignore parse errors.
      }
    });

    es.addEventListener("event", (e: MessageEvent) => {
      try {
        const event: DebugEvent = JSON.parse(e.data);
        pendingRef.current = [...pendingRef.current, event];
        scheduleFlush();
      } catch {
        // Ignore parse errors.
      }
    });

    es.addEventListener("heartbeat", () => {
      // Heartbeat received — connection is alive.
    });

    return () => {
      es.close();
      // Drain anything still buffered so a url change (or unmount) never
      // silently drops events that already arrived.
      cancelFlush();
      flush();
      setConnected(false);
    };
  }, [url, flush, scheduleFlush, cancelFlush]);

  return { connected, events, error };
}
