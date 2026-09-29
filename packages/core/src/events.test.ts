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

describe("createEvent metadata sanitization", () => {
  it("strips sensitive keys before the event reaches the collector", () => {
    const event = createEvent({
      type: "cache:hit",
      metadata: { key: "user:1", password: "hunter2" },
    });
    expect(event.metadata).toEqual({ key: "user:1" });
  });

  it("makes metadata safe to JSON.stringify", () => {
    const circular: Record<string, unknown> = { url: "/a" };
    circular.self = circular;
    const event = createEvent({
      type: "cache:hit",
      metadata: { big: 1n, circular },
    });
    expect(() => JSON.stringify(event)).not.toThrow();
  });

  it("normalizes rich values for display", () => {
    const event = createEvent({
      type: "cache:hit",
      metadata: { at: new Date(0), tags: new Set(["a"]) },
    });
    expect(event.metadata).toEqual({
      at: "1970-01-01T00:00:00.000Z",
      tags: ["a"],
    });
  });

  it("does not mutate the caller's object", () => {
    const metadata = { url: "/a", token: "secret" };
    createEvent({ type: "cache:hit", metadata });
    expect(metadata.token).toBe("secret");
  });

  it("omits metadata entirely when none is supplied", () => {
    expect(createEvent({ type: "error" }).metadata).toBeUndefined();
  });
});
