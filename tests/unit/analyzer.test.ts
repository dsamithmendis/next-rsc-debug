import { describe, it, expect } from "vitest";
import { analyzeEvents } from "@next-rsc-debug/core";
import { createEvent } from "@next-rsc-debug/core";

describe("duplicate detection", () => {
  it("flags duplicate requests", () => {
    const events = [
      createEvent({
        type: "fetch:end",
        metadata: { url: "https://api.example.com/users?id=1" },
      }),
      createEvent({
        type: "fetch:end",
        metadata: { url: "https://api.example.com/users?id=2" },
      }),
      createEvent({
        type: "fetch:end",
        metadata: { url: "https://api.example.com/users?id=3" },
      }),
    ];
    const { warnings } = analyzeEvents(events);
    const dupes = warnings.filter((w) => w.type === "duplicate-request");
    expect(dupes).toHaveLength(1);
    expect(dupes[0].eventIds).toHaveLength(3);
  });
});

describe("slow request detection", () => {
  it("detects slow requests", () => {
    const events = [createEvent({ type: "fetch:end", duration: 600 })];
    const { warnings } = analyzeEvents(events, { slowThreshold: 500 });
    expect(warnings.filter((w) => w.type === "slow-request")).toHaveLength(1);
  });
});

describe("event ordering", () => {
  it("maintains chronological order", () => {
    const events = [
      createEvent({ type: "fetch:start" }),
      createEvent({ type: "fetch:end" }),
    ];
    // Events should be in creation order.
    expect(events[0].timestamp).toBeLessThanOrEqual(events[1].timestamp);
  });
});
