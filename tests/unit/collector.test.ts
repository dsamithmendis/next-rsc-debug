import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getCollector,
  resetCollector,
  createEvent,
} from "@next-rsc-debug/core";

describe("collector", () => {
  beforeEach(() => {
    resetCollector();
  });

  afterEach(() => {
    resetCollector();
  });

  it("returns singleton", () => {
    const a = getCollector();
    const b = getCollector();
    expect(a).toBe(b);
  });

  it("pushes and lists events", () => {
    const collector = getCollector();
    collector.push(createEvent({ type: "fetch:start" }));
    expect(collector.list()).toHaveLength(1);
  });

  it("supports subscriptions", () => {
    const collector = getCollector();
    const received: any[] = [];
    collector.subscribe((e) => received.push(e));
    collector.push(createEvent({ type: "fetch:start" }));
    expect(received).toHaveLength(1);
  });

  it("respects ring buffer capacity", () => {
    const collector = getCollector();
    for (let i = 0; i < 100; i++) {
      collector.push(createEvent({ type: "fetch:start" }));
    }
    // Default capacity is 5000, so all should fit.
    expect(collector.size()).toBe(100);
  });

  it("clear empties the buffer", () => {
    const collector = getCollector();
    collector.push(createEvent({ type: "fetch:start" }));
    collector.clear();
    expect(collector.size()).toBe(0);
  });

  it("resetCollector creates fresh instance", () => {
    const a = getCollector();
    resetCollector();
    const b = getCollector();
    expect(a).not.toBe(b);
  });
});
