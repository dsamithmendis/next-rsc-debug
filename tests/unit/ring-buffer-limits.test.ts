import { describe, it, expect, beforeEach } from "vitest";
import { RingBuffer } from "@next-rsc-debug/core";
import { createEvent } from "@next-rsc-debug/core";

describe("ring-buffer limits", () => {
  let buffer: RingBuffer;

  beforeEach(() => {
    buffer = new RingBuffer({ max: 5 });
  });

  it("evicts oldest events when buffer is full", () => {
    const events = [];
    for (let i = 0; i < 10; i++) {
      const e = createEvent({ type: "fetch:start", metadata: { index: i } });
      events.push(e);
      buffer.push(e);
    }
    const listed = buffer.list();
    expect(listed).toHaveLength(5);
    expect(listed[0].id).toBe(events[5].id);
    expect(listed[4].id).toBe(events[9].id);
  });

  it("maintains FIFO order", () => {
    buffer.push(createEvent({ type: "fetch:start", metadata: { i: 1 } }));
    buffer.push(createEvent({ type: "fetch:start", metadata: { i: 2 } }));
    buffer.push(createEvent({ type: "fetch:start", metadata: { i: 3 } }));
    const events = buffer.list();
    expect(events[0].metadata?.i).toBe(1);
    expect(events[1].metadata?.i).toBe(2);
    expect(events[2].metadata?.i).toBe(3);
  });
});