"use client";

/**
 * Panel-level fault isolation.
 *
 * A devtools panel is fed by whatever the application under observation
 * happens to emit, so a single malformed event must not white-screen the whole
 * dashboard. Each panel is wrapped in its own error boundary plus a Suspense
 * boundary:
 *
 *   - a render error is caught and shown inline, leaving sibling panels alive
 *   - a suspended child (a future `use()`, or lazy-loaded panel code) shows a
 *     skeleton instead of blocking the rest of the dashboard
 *
 * Error boundaries must be class components; React provides no hook equivalent.
 */

import { Component, Suspense, type ErrorInfo, type ReactNode } from "react";

export interface PanelBoundaryProps {
  children: ReactNode;
  /** Human-readable panel name, shown in the error and skeleton states. */
  label: string;
  /**
   * Changing this value clears a caught error and re-renders the children.
   * Error boundaries do not reset on their own, so without this a panel that
   * failed once would stay broken even after the offending data changed. Pass
   * whatever inputs the panel depends on.
   */
  resetKey?: string;
  /** Escape hatch for logging/reporting; the error is always rendered inline. */
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface PanelErrorBoundaryState {
  error: Error | null;
  resetKey: string | undefined;
}

class PanelErrorBoundary extends Component<
  PanelBoundaryProps,
  PanelErrorBoundaryState
> {
  state: PanelErrorBoundaryState = { error: null, resetKey: undefined };

  /**
   * Where the caught error is actually stored. This runs ahead of the re-render
   * that replaces the children, which is why it is preferred over setting state
   * inside `componentDidCatch`.
   */
  static getDerivedStateFromError(
    error: Error,
  ): Partial<PanelErrorBoundaryState> {
    return { error };
  }

  static getDerivedStateFromProps(
    props: PanelBoundaryProps,
    state: PanelErrorBoundaryState,
  ): Partial<PanelErrorBoundaryState> | null {
    if (props.resetKey !== state.resetKey) {
      return { error: null, resetKey: props.resetKey };
    }
    return null;
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
  }

  override render(): ReactNode {
    if (this.state.error) {
      return (
        <PanelErrorState label={this.props.label} error={this.state.error} />
      );
    }
    return this.props.children;
  }
}

function PanelErrorState({ label, error }: { label: string; error: Error }) {
  return (
    <div className="nrpd-panel-error" role="alert">
      <strong>{label} failed to render.</strong>
      <span className="nrpd-panel-error-message">{error.message}</span>
    </div>
  );
}

function PanelSkeleton({ label }: { label: string }) {
  return (
    <div
      className="nrpd-skeleton"
      aria-busy="true"
      aria-label={`Loading ${label}`}
    >
      <div className="nrpd-skeleton-bar" />
      <div className="nrpd-skeleton-bar" />
      <div className="nrpd-skeleton-bar" />
    </div>
  );
}

/**
 * Composes the error boundary *outside* the Suspense boundary so a suspended
 * child shows the skeleton while a thrown error shows the error state.
 */
export function PanelBoundary({
  children,
  label,
  resetKey,
  onError,
}: PanelBoundaryProps) {
  return (
    <PanelErrorBoundary label={label} resetKey={resetKey} onError={onError}>
      <Suspense fallback={<PanelSkeleton label={label} />}>{children}</Suspense>
    </PanelErrorBoundary>
  );
}
