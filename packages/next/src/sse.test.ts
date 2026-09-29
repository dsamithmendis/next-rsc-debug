import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { ServerResponse } from "node:http";
import {
  formatSseEvent,
  addSseClient,
  closeAllSseClients,
  getSseClientCount,
} from "./sse";
import {
  getCollector,
  resetCollector,
  createEvent,
} from "@next-rsc-debug/core";

/** Minimal ServerResponse stand-in that records what was written. */
function fakeRes() {
  const writes: string[] = [];
  let ended = false;
  const res = {
    writeHead: () => res,
    write: (chunk: string) => {
      writes.push(chunk);
      return true;
    },
    end: () => {
      ended = true;
      return res;
    },
    on: () => res,
  } as unknown as ServerResponse & { writes: string[]; ended: boolean };
  (res as unknown as { writes: string[]; ended: boolean }).writes = writes;
  (res as unknown as { writes: string[]; ended: boolean }).ended = false;
  Object.defineProperty(res, "ended", {
    get: () => ended,
    set: (v: boolean) => {
      ended = v;
    },
  });
  return res;
}

function writesOf(res: ReturnType<typeof fakeRes>): string[] {
  return (res as unknown as { writes: string[] }).writes;
}

beforeEach(() => {
  resetCollector();
});

afterEach(() => {
  closeAllSseClients();
});

describe("formatSseEvent", () => {
  it("emits a well-formed frame", () => {
    expect(formatSseEvent("event", { a: 1 })).toBe(
      'event: event\ndata: {"a":1}\n\n',
    );
  });

  it("does not throw on a circular payload", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(() => formatSseEvent("event", circular)).not.toThrow();
    expect(formatSseEvent("event", circular)).toContain("serializationError");
  });

  it("does not throw on a BigInt payload", () => {
    expect(() => formatSseEvent("event", { n: 1n })).not.toThrow();
  });

  it("handles undefined without emitting the string 'undefined'", () => {
    expect(formatSseEvent("heartbeat", undefined)).toBe(
      "event: heartbeat\ndata: null\n\n",
    );
  });

  it("cannot be broken by newlines inside a payload", () => {
    const frame = formatSseEvent("event", { msg: "a\n\nb" });
    // Exactly one terminator: the newlines inside the value are escaped.
    expect(frame.match(/\n\n/g)).toHaveLength(1);
  });
});

describe("addSseClient", () => {
  it("sends a snapshot containing existing events", () => {
    const collector = getCollector();
    collector.push(createEvent({ type: "fetch:start" }));
    const res = fakeRes();

    addSseClient(res);

    const snapshot = writesOf(res)[0];
    expect(snapshot).toContain("event: snapshot");
    expect(snapshot).toContain("fetch:start");
  });

  it("does not throw when the collector holds a poisoned event", () => {
    // Bypass createEvent's sanitization to simulate a hand-rolled producer.
    const collector = getCollector();
    const poisoned: Record<string, unknown> = { url: "/a" };
    poisoned.loop = poisoned;
    collector.push({
      id: "evt_bad",
      type: "cache:hit",
      timestamp: Date.now(),
      metadata: poisoned,
    } as never);

    const res = fakeRes();
    expect(() => addSseClient(res)).not.toThrow();
  });

  it("streams new events to the client", () => {
    const collector = getCollector();
    const res = fakeRes();
    addSseClient(res);

    collector.push(createEvent({ type: "fetch:end" }));

    const streamed = writesOf(res).join("");
    expect(streamed).toContain("event: event");
    expect(streamed).toContain("fetch:end");
  });

  it("does not disconnect a client when a payload cannot be serialized", () => {
    const collector = getCollector();
    const res = fakeRes();
    addSseClient(res);
    expect(getSseClientCount()).toBe(1);

    // Hand-rolled producer that bypasses createEvent's sanitization.
    const poisoned: Record<string, unknown> = { id: "evt_bad" };
    poisoned.self = poisoned;
    collector.push(poisoned as never);

    // Before the fix this serialization failure was indistinguishable from a
    // dead socket, so the catch unsubscribed a perfectly healthy client and
    // the live panel silently froze.
    expect(getSseClientCount()).toBe(1);
    expect(writesOf(res).join("")).toContain("serializationError");
  });

  it("drops a client whose socket has actually died", () => {
    const collector = getCollector();
    const res = fakeRes();
    addSseClient(res);
    expect(getSseClientCount()).toBe(1);

    // Fail only the streamed write, leaving the snapshot intact.
    (res as unknown as { write: () => boolean }).write = () => {
      throw new Error("EPIPE");
    };
    collector.push(createEvent({ type: "fetch:end" }));

    expect(getSseClientCount()).toBe(0);
  });

  it("closes the response when the initial snapshot cannot be written", () => {
    const res = fakeRes();
    (res as unknown as { write: () => boolean }).write = () => {
      throw new Error("EPIPE");
    };

    // Must not escape: headers are already flushed, so throwing here would
    // 500 the route rather than closing the stream.
    expect(() => addSseClient(res)).not.toThrow();
    expect(getSseClientCount()).toBe(0);
    expect((res as unknown as { ended: boolean }).ended).toBe(true);
  });
});
