import { describe, it, expect } from "vitest";
import {
  analyzeEvents,
  normalizeFetchUrl,
  isFetchEventType,
  isNavigationEventType,
  isRscEventType,
  isCacheEventType,
  isActionEventType,
  isErrorEventType,
} from "../src/analyzer";
import { createEvent } from "../src/events";

describe("analyzeEvents", () => {
  it("detects slow requests", () => {
    const events = [
      createEvent({ type: "fetch:end", duration: 600 }),
      createEvent({ type: "fetch:end", duration: 100 }),
    ];
    const { warnings } = analyzeEvents(events, { slowThreshold: 500 });
    expect(warnings).toHaveLength(1);
    expect(warnings[0].type).toBe("slow-request");
    expect(warnings[0].eventIds).toHaveLength(1);
  });

  it("uses default threshold of 500ms", () => {
    const events = [createEvent({ type: "fetch:end", duration: 500 })];
    const { warnings } = analyzeEvents(events);
    expect(warnings).toHaveLength(1);
  });

  it("detects duplicate requests by normalized URL", () => {
    const events = [
      createEvent({
        type: "fetch:end",
        requestId: "req_1",
        metadata: { url: "https://api.example.com/users?id=1" },
      }),
      createEvent({
        type: "fetch:end",
        requestId: "req_2",
        metadata: { url: "https://api.example.com/users?id=1" },
      }),
      createEvent({
        type: "fetch:end",
        requestId: "req_3",
        metadata: { url: "https://api.example.com/users?id=1" },
      }),
    ];
    const { warnings } = analyzeEvents(events);
    const dupes = warnings.filter((w) => w.type === "duplicate-request");
    expect(dupes).toHaveLength(1);
    expect(dupes[0].eventIds).toHaveLength(3);
  });

  it("does not report differing query params as duplicates", () => {
    // Stripping the query string entirely used to collapse these three into one
    // group, which is a false positive: they are different resources.
    const events = [
      createEvent({
        type: "fetch:end",
        requestId: "req_1",
        metadata: { url: "https://api.example.com/users?id=1" },
      }),
      createEvent({
        type: "fetch:end",
        requestId: "req_2",
        metadata: { url: "https://api.example.com/users?id=2" },
      }),
      createEvent({
        type: "fetch:end",
        requestId: "req_3",
        metadata: { url: "https://api.example.com/users?id=3" },
      }),
    ];
    const { warnings } = analyzeEvents(events);
    expect(warnings.filter((w) => w.type === "duplicate-request")).toHaveLength(
      0,
    );
  });

  it("still detects duplicates that differ only by a sensitive param", () => {
    const events = [
      createEvent({
        type: "fetch:end",
        requestId: "req_1",
        metadata: { url: "https://api.example.com/data?token=aaa" },
      }),
      createEvent({
        type: "fetch:end",
        requestId: "req_2",
        metadata: { url: "https://api.example.com/data?token=bbb" },
      }),
    ];
    const { warnings } = analyzeEvents(events);
    expect(warnings.filter((w) => w.type === "duplicate-request")).toHaveLength(
      1,
    );
  });

  it("does not flag unique URLs as duplicates", () => {
    const events = [
      createEvent({
        type: "fetch:end",
        metadata: { url: "https://api.example.com/users" },
      }),
      createEvent({
        type: "fetch:end",
        metadata: { url: "https://api.example.com/posts" },
      }),
    ];
    const { warnings } = analyzeEvents(events);
    expect(warnings.filter((w) => w.type === "duplicate-request")).toHaveLength(
      0,
    );
  });

  it("detects error events", () => {
    const events = [
      createEvent({ type: "error", metadata: { message: "Something failed" } }),
    ];
    const { warnings } = analyzeEvents(events);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].type).toBe("error");
  });

  it("returns empty warnings for clean events", () => {
    const events = [
      createEvent({
        type: "fetch:end",
        duration: 100,
        metadata: { url: "/api/foo" },
      }),
    ];
    const { warnings } = analyzeEvents(events);
    expect(warnings).toHaveLength(0);
  });
});

describe("normalizeFetchUrl", () => {
  it("returns sanitized URL for fetch:end", () => {
    const event = createEvent({
      type: "fetch:end",
      metadata: { url: "https://api.example.com/data?token=secret" },
    });
    expect(normalizeFetchUrl(event)).toBe("https://api.example.com/data");
  });

  it("returns undefined for non-fetch events", () => {
    const event = createEvent({ type: "navigation:start" });
    expect(normalizeFetchUrl(event)).toBeUndefined();
  });
});

describe("event type guards", () => {
  it("isFetchEventType", () => {
    expect(isFetchEventType("fetch:start")).toBe(true);
    expect(isFetchEventType("fetch:end")).toBe(true);
    expect(isFetchEventType("navigation:start")).toBe(false);
  });

  it("isNavigationEventType", () => {
    expect(isNavigationEventType("navigation:start")).toBe(true);
    expect(isNavigationEventType("navigation:end")).toBe(true);
    expect(isNavigationEventType("rsc:start")).toBe(false);
  });

  it("isRscEventType", () => {
    expect(isRscEventType("rsc:start")).toBe(true);
    expect(isRscEventType("rsc:end")).toBe(true);
  });

  it("isCacheEventType", () => {
    expect(isCacheEventType("cache:hit")).toBe(true);
    expect(isCacheEventType("cache:miss")).toBe(true);
    expect(isCacheEventType("cache:invalidate")).toBe(true);
  });

  it("isActionEventType", () => {
    expect(isActionEventType("action:start")).toBe(true);
    expect(isActionEventType("action:end")).toBe(true);
  });

  it("isErrorEventType", () => {
    expect(isErrorEventType("error")).toBe(true);
    expect(isErrorEventType("fetch:start")).toBe(false);
  });
});
