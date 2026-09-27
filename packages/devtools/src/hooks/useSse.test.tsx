import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { DebugEvent } from "@next-rsc-debug/core";
import { createEvent } from "@next-rsc-debug/core";
import { useSse } from "./useSse";

/**
 * Minimal EventSource stub. jsdom does not implement EventSource, so we
 * provide a controllable fake that records listeners and lets tests emit.
 */
class FakeEventSource {
  static instances: FakeEventSource[] = [];

  url: string;
  closed = false;
  onopen: (() => void) | null = null;
  onerror: (() => void) | null = null;
  private listeners = new Map<string, Array<(e: MessageEvent) => void>>();

  constructor(url: string) {
    this.url = url;
    FakeEventSource.instances.push(this);
  }

  addEventListener(type: string, fn: (e: MessageEvent) => void) {
    const existing = this.listeners.get(type) ?? [];
    existing.push(fn);
    this.listeners.set(type, existing);
  }

  close() {
    this.closed = true;
  }

  emit(type: string, data: unknown) {
    const event = { data: JSON.stringify(data) } as MessageEvent;
    for (const fn of this.listeners.get(type) ?? []) {
      fn(event);
    }
  }

  static last(): FakeEventSource {
    return FakeEventSource.instances[FakeEventSource.instances.length - 1];
  }
}

const original = globalThis.EventSource;

beforeEach(() => {
  FakeEventSource.instances = [];
  (globalThis as unknown as { EventSource: unknown }).EventSource = FakeEventSource;
});

afterEach(() => {
  (globalThis as unknown as { EventSource: unknown }).EventSource = original;
  vi.restoreAllMocks();
});

describe("useSse", () => {
  it("opens an EventSource against the provided url", () => {
    renderHook(() => useSse("/api/debug-events"));
    expect(FakeEventSource.last().url).toBe("/api/debug-events");
  });

  it("reports connected state after open", async () => {
    const { result } = renderHook(() => useSse("/api/debug-events"));

    await act(async () => {
      FakeEventSource.last().onopen?.();
    });

    expect(result.current.connected).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("replaces events when a snapshot arrives", async () => {
    const { result } = renderHook(() => useSse("/api/debug-events"));
    const events: DebugEvent[] = [createEvent({ type: "fetch:start" })];

    await act(async () => {
      FakeEventSource.last().emit("snapshot", { events });
    });

    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0].type).toBe("fetch:start");
  });

  it("appends events as they stream in", async () => {
    const { result } = renderHook(() => useSse("/api/debug-events"));

    await act(async () => {
      FakeEventSource.last().emit("event", createEvent({ type: "fetch:start" }));
      FakeEventSource.last().emit("event", createEvent({ type: "fetch:end" }));
    });

    await waitFor(() => expect(result.current.events).toHaveLength(2));
  });

  it("ignores malformed payloads instead of throwing", async () => {
    const { result } = renderHook(() => useSse("/api/debug-events"));

    await act(async () => {
      const es = FakeEventSource.last();
      const bad = { data: "not json" } as MessageEvent;
      for (const fn of (es as unknown as {
        listeners: Map<string, Array<(e: MessageEvent) => void>>;
      }).listeners.get("event") ?? []) {
        fn(bad);
      }
    });

    expect(result.current.events).toHaveLength(0);
  });

  it("surfaces an error and disconnects on failure", async () => {
    const { result } = renderHook(() => useSse("/api/debug-events"));

    await act(async () => {
      FakeEventSource.last().onerror?.();
    });

    expect(result.current.connected).toBe(false);
    expect(result.current.error).toBe("Connection lost");
  });

  it("closes the connection on unmount", () => {
    const { unmount } = renderHook(() => useSse("/api/debug-events"));
    const es = FakeEventSource.last();
    unmount();
    expect(es.closed).toBe(true);
  });
});