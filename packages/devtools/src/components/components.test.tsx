import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { DebugEvent } from "@next-rsc-debug/core";
import { createEvent } from "@next-rsc-debug/core";
import { Summary } from "./Summary";
import { Timeline } from "./Timeline";
import { Warnings } from "./Warnings";
import { FetchInspector } from "./FetchInspector";
import { filterEvents, FILTER_OPTIONS } from "./Filters";

function makeEvent(overrides: Partial<DebugEvent> = {}): DebugEvent {
  return { ...createEvent({ type: "fetch:start" }), ...overrides };
}

afterEach(() => {
  cleanup();
});

describe("Summary", () => {
  it("renders zeroed cards when there are no events", () => {
    render(<Summary events={[]} threshold={500} />);
    expect(screen.getByText("Events")).toBeInTheDocument();
    expect(screen.getByText("Fetches")).toBeInTheDocument();
    expect(screen.getByText("Duplicates")).toBeInTheDocument();
  });

  it("counts fetch events", () => {
    const events = [
      makeEvent({ type: "fetch:start" }),
      makeEvent({ type: "fetch:end" }),
    ];
    render(<Summary events={events} threshold={500} />);
    const fetches = screen.getByText("Fetches").parentElement;
    expect(fetches?.textContent).toContain("2");
  });

  it("counts slow requests against the threshold", () => {
    const events = [
      makeEvent({ type: "fetch:end", duration: 900 }),
      makeEvent({ type: "fetch:end", duration: 10 }),
    ];
    render(<Summary events={events} threshold={500} />);
    const slow = screen.getByText("Slow").parentElement;
    expect(slow?.textContent).toContain("1");
  });
});

describe("Timeline", () => {
  it("shows an empty state when there are no events", () => {
    render(<Timeline events={[]} />);
    expect(screen.getByText("No events yet.")).toBeInTheDocument();
  });

  it("renders fetch labels with method and url", () => {
    const event = makeEvent({
      type: "fetch:end",
      duration: 120,
      metadata: { method: "GET", url: "https://example.com/api", status: 200 },
    });
    render(<Timeline events={[event]} />);
    expect(
      screen.getByText(/fetch GET https:\/\/example.com\/api 200/),
    ).toBeInTheDocument();
    expect(screen.getByText(/\(120ms\)/)).toBeInTheDocument();
  });

  it("invokes onSelect when an event is clicked", () => {
    const event = makeEvent({ type: "rsc:start" });
    let selected: DebugEvent | undefined;
    render(<Timeline events={[event]} onSelect={(e) => (selected = e)} />);
    screen
      .getByText(/RSC request/)
      .closest(".nrpd-timeline-item")
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(selected?.id).toBe(event.id);
  });
});

describe("Warnings", () => {
  it("shows an empty state when nothing is wrong", () => {
    render(<Warnings events={[]} />);
    expect(screen.getByText("No warnings detected.")).toBeInTheDocument();
  });

  it("surfaces slow request warnings", () => {
    const events = [makeEvent({ type: "fetch:end", duration: 1200 })];
    render(<Warnings events={events} threshold={500} />);
    expect(screen.getByText(/Warnings \(/)).toBeInTheDocument();
  });
});

describe("FetchInspector", () => {
  it("prompts for a selection when no event is given", () => {
    render(<FetchInspector event={null} />);
    expect(screen.getByText("Select an event to inspect.")).toBeInTheDocument();
  });

  it("renders metadata rows for the selected event", () => {
    const event = makeEvent({
      type: "fetch:end",
      requestId: "req_1",
      metadata: {
        method: "POST",
        url: "https://example.com/x",
        status: 201,
        duration: 42,
      },
    });
    render(<FetchInspector event={event} />);
    expect(screen.getByText("POST")).toBeInTheDocument();
    expect(screen.getByText("201")).toBeInTheDocument();
    expect(screen.getByText("42ms")).toBeInTheDocument();
    expect(screen.getByText("req_1")).toBeInTheDocument();
  });
});

describe("filterEvents", () => {
  const events = [
    makeEvent({ type: "fetch:start" }),
    makeEvent({ type: "fetch:end", duration: 900 }),
    makeEvent({ type: "error" }),
    makeEvent({ type: "cache:hit" }),
  ];

  it("returns everything for the all filter", () => {
    expect(filterEvents(events, "all", 500)).toHaveLength(events.length);
  });

  it("filters to fetch events", () => {
    expect(filterEvents(events, "fetch", 500)).toHaveLength(2);
  });

  it("filters to error events", () => {
    expect(filterEvents(events, "error", 500)).toHaveLength(1);
  });

  it("filters to events at or above the slow threshold", () => {
    expect(filterEvents(events, "slow", 500)).toHaveLength(1);
  });

  it("exposes filter options for the UI", () => {
    expect(FILTER_OPTIONS.map((o) => o.id)).toContain("slow");
  });
});
