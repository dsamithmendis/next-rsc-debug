import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getCollector, resetCollector } from "@next-rsc-debug/core";
import {
  debugComponent,
  debugCacheHit,
  debugCacheMiss,
  debugCacheInvalidate,
  resetDebugApi,
} from "../src/debug-api";

describe("debug-api", () => {
  beforeEach(() => {
    resetCollector();
    resetDebugApi();
  });

  afterEach(() => {
    resetCollector();
    resetDebugApi();
  });

  it("debugComponent records rsc:start and rsc:end", async () => {
    await debugComponent("Article", async () => {
      return "done";
    });
    const events = getCollector().list();
    expect(events.some((e) => e.type === "rsc:start")).toBe(true);
    expect(events.some((e) => e.type === "rsc:end")).toBe(true);
    const start = events.find((e) => e.type === "rsc:start");
    const end = events.find((e) => e.type === "rsc:end");
    expect(start?.metadata?.component).toBe("Article");
    expect(end?.parentId).toBe(start?.id);
  });

  it("debugComponent handles sync functions", async () => {
    await debugComponent("Sync", () => "value");
    const events = getCollector().list();
    expect(events.filter((e) => e.type === "rsc:end")).toHaveLength(1);
  });

  it("debugComponent handles errors", async () => {
    await expect(
      debugComponent("Failing", async () => {
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");
    const events = getCollector().list();
    expect(events.some((e) => e.type === "rsc:end")).toBe(true);
  });

  it("debugCacheHit records cache:hit", () => {
    debugCacheHit("user:123");
    const events = getCollector().list();
    expect(events.some((e) => e.type === "cache:hit")).toBe(true);
  });

  it("debugCacheMiss records cache:miss", () => {
    debugCacheMiss("user:123");
    const events = getCollector().list();
    expect(events.some((e) => e.type === "cache:miss")).toBe(true);
  });

  it("debugCacheInvalidate records cache:invalidate", () => {
    debugCacheInvalidate("user:123");
    const events = getCollector().list();
    expect(events.some((e) => e.type === "cache:invalidate")).toBe(true);
  });
});
