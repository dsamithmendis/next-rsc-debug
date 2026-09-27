import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  wrapFetch,
  unwrapFetch,
  isFetchInstrumented,
} from "../src/fetch-instrument";
import { getCollector, resetCollector } from "@next-rsc-debug/core";

describe("fetch-instrument", () => {
  beforeEach(() => {
    resetCollector();
    if (isFetchInstrumented()) {
      unwrapFetch();
    }
  });

  afterEach(() => {
    if (isFetchInstrumented()) {
      unwrapFetch();
    }
    resetCollector();
  });

  it("wraps global fetch", () => {
    expect(isFetchInstrumented()).toBe(false);
    wrapFetch();
    expect(isFetchInstrumented()).toBe(true);
  });

  it("does not double-wrap", () => {
    wrapFetch();
    const fetch1 = globalThis.fetch;
    wrapFetch();
    expect(globalThis.fetch).toBe(fetch1);
  });

  it("records fetch:start and fetch:end", async () => {
    wrapFetch();
    // Use a data URL to avoid network dependency in tests.
    await fetch("data:text/plain,hello");
    const events = getCollector().list();
    const starts = events.filter((e) => e.type === "fetch:start");
    const ends = events.filter((e) => e.type === "fetch:end");
    expect(starts).toHaveLength(1);
    expect(ends).toHaveLength(1);
    expect(starts[0].requestId).toBe(ends[0].requestId);
    expect(ends[0].metadata?.status).toBe(200);
  });

  it("sanitizes URLs", async () => {
    wrapFetch();
    await fetch("data:text/plain,world");
    const events = getCollector().list();
    const end = events.find((e) => e.type === "fetch:end");
    expect(end?.metadata?.url).not.toContain("?");
  });

  it("emits error event on failure", async () => {
    wrapFetch();
    await expect(fetch("invalid-url-that-will-fail")).rejects.toBeDefined();
    const events = getCollector().list();
    const errors = events.filter((e) => e.type === "error");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("does not record bodies", async () => {
    wrapFetch();
    const res = await fetch("data:text/plain,hello");
    const events = getCollector().list();
    const end = events.find((e) => e.type === "fetch:end");
    expect(end?.metadata).not.toHaveProperty("body");
    expect(end?.metadata).not.toHaveProperty("responseBody");
    expect(res).toBeDefined();
  });

  it("unwrap restores original fetch", () => {
    wrapFetch();
    const wrapped = globalThis.fetch;
    unwrapFetch();
    expect(isFetchInstrumented()).toBe(false);
    expect(globalThis.fetch).not.toBe(wrapped);
  });
});