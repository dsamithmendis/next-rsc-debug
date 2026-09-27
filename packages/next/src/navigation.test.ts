import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getCollector, resetCollector, createEvent } from "@next-rsc-debug/core";
import {
  startNavigation,
  endNavigation,
  getCurrentNavigationId,
} from "../src/navigation";
import {
  startRscRequest,
  endRscRequest,
  getActiveRscRequestId,
} from "../src/rsc-tracking";

describe("navigation", () => {
  beforeEach(() => {
    resetCollector();
  });

  afterEach(() => {
    resetCollector();
  });

  it("starts and ends navigation", () => {
    const navId = startNavigation();
    expect(navId).toBeTruthy();
    expect(getCurrentNavigationId()).toBe(navId);

    endNavigation(navId);

    const events = getCollector().list();
    expect(events.some((e) => e.type === "navigation:start")).toBe(true);
    expect(events.some((e) => e.type === "navigation:end")).toBe(true);
    expect(getCurrentNavigationId()).toBeNull();
  });

  it("endNavigation without start is a no-op", () => {
    expect(() => endNavigation("nonexistent")).not.toThrow();
  });
});

describe("rsc-tracking", () => {
  beforeEach(() => {
    resetCollector();
  });

  afterEach(() => {
    resetCollector();
  });

  it("starts and ends RSC request", () => {
    const reqId = startRscRequest({ route: "/news" });
    expect(reqId).toBeTruthy();
    expect(getActiveRscRequestId()).toBe(reqId);

    endRscRequest(reqId);

    const events = getCollector().list();
    expect(events.some((e) => e.type === "rsc:start")).toBe(true);
    expect(events.some((e) => e.type === "rsc:end")).toBe(true);
    expect(getActiveRscRequestId()).toBeNull();
  });

  it("attaches parentId to nested events", () => {
    const navId = startNavigation();
    const reqId = startRscRequest({ route: "/news", parentId: navId });
    const events = getCollector().list();
    const start = events.find((e) => e.type === "rsc:start");
    expect(start?.parentId).toBe(navId);
    endRscRequest(reqId);
    endNavigation(navId);
  });
});