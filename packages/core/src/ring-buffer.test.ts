import { describe, it, expect, beforeEach } from "vitest";
import { RingBuffer } from "../src/ring-buffer";
import { createEvent } from "../src/events";

describe("RingBuffer", () => {
  let buffer: RingBuffer;

  beforeEach(() => {
    buffer = new RingBuffer({ max: 3 });
  });

  it("starts empty", () => {
    expect(buffer.size).toBe(0);
    expect(buffer.list()).toEqual([]);
  });

  it("pushes and lists events", () => {
    buffer.push(createEvent({ type: "fetch:start" }));
    buffer.push(createEvent({ type: "fetch:end" }));
    expect(buffer.size).toBe(2);
    expect(buffer.list()).toHaveLength(2);
  });

  it("evicts oldest events when full", () => {
    const e1 = createEvent({ type: "fetch:start" });
    const e2 = createEvent({ type: "fetch:start" });
    const e3 = createEvent({ type: "fetch:start" });
    const e4 = createEvent({ type: "fetch:start" });

    buffer.push(e1);
    buffer.push(e2);
    buffer.push(e3);
    buffer.push(e4);

    const events = buffer.list();
    expect(events).toHaveLength(3);
    expect(events[0].id).toBe(e2.id);
    expect(events[1].id).toBe(e3.id);
    expect(events[2].id).toBe(e4.id);
  });

  it("clear empties the buffer", () => {
    buffer.push(createEvent({ type: "fetch:start" }));
    buffer.clear();
    expect(buffer.size).toBe(0);
    expect(buffer.list()).toEqual([]);
  });

  it("notifies subscribers on push", () => {
    const received: any[] = [];
    buffer.subscribe((event) => received.push(event));
    buffer.push(createEvent({ type: "fetch:start" }));
    expect(received).toHaveLength(1);
  });

  it("supports unsubscribe", () => {
    const received: any[] = [];
    const unsub = buffer.subscribe((event) => received.push(event));
    buffer.push(createEvent({ type: "fetch:start" }));
    expect(received).toHaveLength(1);
    unsub();
    buffer.push(createEvent({ type: "fetch:start" }));
    expect(received).toHaveLength(1);
  });

  it("uses default capacity of 5000", () => {
    const big = new RingBuffer();
    expect(big.capacity).toBe(5000);
  });

  it("throws on invalid max", () => {
    expect(() => new RingBuffer({ max: 0 })).toThrow();
    expect(() => new RingBuffer({ max: -1 })).toThrow();
    expect(() => new RingBuffer({ max: NaN })).toThrow();
  });

  it("listener errors do not crash the collector", () => {
    buffer.subscribe(() => {
      throw new Error("boom");
    });
    expect(() =>
      buffer.push(createEvent({ type: "fetch:start" })),
    ).not.toThrow();
  });

  it("listRange returns slice", () => {
    for (let i = 0; i < 5; i++) {
      buffer.push(createEvent({ type: "fetch:start" }));
    }
    // buffer max is 3, so only last 3 exist
    const range = buffer.listRange(0, 2);
    expect(range).toHaveLength(2);
  });

  it("destroy clears events and listeners", () => {
    buffer.push(createEvent({ type: "fetch:start" }));
    buffer.subscribe(() => {});
    buffer.destroy();
    expect(buffer.size).toBe(0);
    expect(buffer.listenerCount).toBe(0);
  });
});
