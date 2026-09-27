import { describe, it, expect } from "vitest";
import {
  createEvent,
  createRequestId,
  createNavigationId,
  createEventId,
} from "../src/events";

describe("events", () => {
  it("creates an event with required fields", () => {
    const event = createEvent({ type: "fetch:start" });
    expect(event.id).toBeTruthy();
    expect(event.type).toBe("fetch:start");
    expect(event.timestamp).toBeLessThanOrEqual(Date.now());
    expect(event.requestId).toBeUndefined();
  });

  it("includes optional fields when provided", () => {
    const event = createEvent({
      type: "fetch:end",
      requestId: "req_123",
      parentId: "nav_456",
      duration: 42,
      metadata: { url: "/api/foo" },
    });
    expect(event.requestId).toBe("req_123");
    expect(event.parentId).toBe("nav_456");
    expect(event.duration).toBe(42);
    expect(event.metadata).toEqual({ url: "/api/foo" });
  });

  it("generates unique IDs", () => {
    const a = createEvent({ type: "fetch:start" });
    const b = createEvent({ type: "fetch:start" });
    expect(a.id).not.toBe(b.id);
  });

  it("createRequestId generates unique ids", () => {
    const a = createRequestId();
    const b = createRequestId();
    expect(a).not.toBe(b);
    expect(a.startsWith("req_")).toBe(true);
  });

  it("createNavigationId generates nav ids", () => {
    const id = createNavigationId();
    expect(id.startsWith("nav_")).toBe(true);
  });

  it("createEventId uses prefix", () => {
    const id = createEventId("custom");
    expect(id.startsWith("custom_")).toBe(true);
  });
});
