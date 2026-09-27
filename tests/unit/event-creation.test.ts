import { describe, it, expect } from "vitest";
import { createEvent, createRequestId } from "@next-rsc-debug/core";

describe("event creation", () => {
  it("creates event with unique ID", () => {
    const a = createEvent({ type: "fetch:start" });
    const b = createEvent({ type: "fetch:start" });
    expect(a.id).not.toBe(b.id);
  });

  it("includes timestamp", () => {
    const before = Date.now();
    const event = createEvent({ type: "fetch:start" });
    const after = Date.now();
    expect(event.timestamp).toBeGreaterThanOrEqual(before);
    expect(event.timestamp).toBeLessThanOrEqual(after);
  });
});

describe("request IDs", () => {
  it("generates unique request IDs", () => {
    const ids = new Set();
    for (let i = 0; i < 100; i++) {
      ids.add(createRequestId());
    }
    expect(ids.size).toBe(100);
  });
});