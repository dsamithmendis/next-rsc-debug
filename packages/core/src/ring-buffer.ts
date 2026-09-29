/**
 * In-memory ring buffer for events.
 *
 * Requirements:
 * - Configurable max event count (default 5000).
 * - FIFO eviction.
 * - list(), clear(), push().
 * - Subscription support.
 * - Safe concurrent usage in Node.js.
 * - No memory leaks.
 */

import type { DebugEvent } from "./events.js";

export type EventListener = (event: DebugEvent) => void;
export type Unsubscribe = () => void;

export interface RingBufferOptions {
  max?: number;
}

/**
 * Shared by the server-side ring buffer and the client-side event list, so the
 * two cannot drift apart and leave the UI holding more history than the server
 * is willing to keep.
 */
export const DEFAULT_MAX_EVENTS = 5000;

export class RingBuffer {
  private readonly max: number;
  private events: DebugEvent[] = [];
  private listeners: EventListener[] = [];

  constructor(options: RingBufferOptions = {}) {
    this.max = options.max ?? DEFAULT_MAX_EVENTS;
    if (!Number.isFinite(this.max) || this.max <= 0) {
      throw new Error("RingBuffer max must be a positive number");
    }
  }

  push(event: DebugEvent): void {
    this.events.push(event);
    if (this.events.length > this.max) {
      this.events.shift();
    }
    // Notify listeners (synchronous, bounded).
    for (let i = 0; i < this.listeners.length; i++) {
      const listener = this.listeners[i];
      try {
        listener(event);
      } catch {
        // Never let a listener crash the collector.
      }
    }
  }

  list(): DebugEvent[] {
    return this.events.slice();
  }

  listRange(start: number, end: number): DebugEvent[] {
    const len = this.events.length;
    const from = Math.max(0, Math.min(start, len));
    const to = Math.max(0, Math.min(end, len));
    return this.events.slice(from, to);
  }

  clear(): void {
    this.events = [];
  }

  get size(): number {
    return this.events.length;
  }

  get capacity(): number {
    return this.max;
  }

  subscribe(listener: EventListener): Unsubscribe {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  get listenerCount(): number {
    return this.listeners.length;
  }

  destroy(): void {
    this.events = [];
    this.listeners = [];
  }
}
