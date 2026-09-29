import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { PanelBoundary } from "./PanelBoundary";

/** A panel that always throws while rendering. */
function Exploding(): never {
  throw new Error("panel exploded");
}

/** A panel that suspends forever, as `use()` on a pending promise would. */
function SuspendsForever(): never {
  throw new Promise<void>(() => {
    // Never settles — the boundary should hold the skeleton indefinitely.
  });
}

let shouldThrow = true;

/** A panel that throws on the first render and succeeds afterwards. */
function Flaky() {
  if (shouldThrow) {
    throw new Error("transient failure");
  }
  return <span>recovered</span>;
}

beforeEach(() => {
  shouldThrow = true;
  // React logs caught render errors to console.error; mock it so the test
  // output stays readable.
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("PanelBoundary", () => {
  it("renders children when nothing goes wrong", () => {
    render(
      <PanelBoundary label="Healthy">
        <span>all good</span>
      </PanelBoundary>,
    );
    expect(screen.getByText("all good")).toBeInTheDocument();
  });

  it("contains a render error instead of unmounting the tree", () => {
    render(
      <div>
        <PanelBoundary label="Bad">
          <Exploding />
        </PanelBoundary>
        <PanelBoundary label="Good">
          <span>sibling survived</span>
        </PanelBoundary>
      </div>,
    );

    expect(screen.getByText("Bad failed to render.")).toBeInTheDocument();
    expect(screen.getByText("panel exploded")).toBeInTheDocument();
    // The whole point of the boundary: a neighbouring panel keeps working.
    expect(screen.getByText("sibling survived")).toBeInTheDocument();
  });

  it("marks the error state for assistive tech", () => {
    render(
      <PanelBoundary label="Bad">
        <Exploding />
      </PanelBoundary>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("shows a skeleton while a child is suspended", () => {
    render(
      <PanelBoundary label="Slow">
        <SuspendsForever />
      </PanelBoundary>,
    );
    const skeleton = screen.getByLabelText("Loading Slow");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute("aria-busy", "true");
  });

  it("clears a caught error when resetKey changes", () => {
    const { rerender } = render(
      <PanelBoundary label="Flaky" resetKey="a">
        <Flaky />
      </PanelBoundary>,
    );
    expect(screen.getByText("transient failure")).toBeInTheDocument();

    shouldThrow = false;
    rerender(
      <PanelBoundary label="Flaky" resetKey="b">
        <Flaky />
      </PanelBoundary>,
    );

    expect(screen.getByText("recovered")).toBeInTheDocument();
    expect(screen.queryByText("transient failure")).not.toBeInTheDocument();
  });

  it("keeps the error when resetKey is unchanged", () => {
    const { rerender } = render(
      <PanelBoundary label="Flaky" resetKey="same">
        <Flaky />
      </PanelBoundary>,
    );
    expect(screen.getByText("transient failure")).toBeInTheDocument();

    shouldThrow = false;
    rerender(
      <PanelBoundary label="Flaky" resetKey="same">
        <Flaky />
      </PanelBoundary>,
    );
    // Without a key change the boundary must not silently retry.
    expect(screen.getByText("transient failure")).toBeInTheDocument();
  });

  it("invokes onError with the caught error", () => {
    const onError = vi.fn();
    render(
      <PanelBoundary label="Bad" onError={onError}>
        <Exploding />
      </PanelBoundary>,
    );
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
  });
});
