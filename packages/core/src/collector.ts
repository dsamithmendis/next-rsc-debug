/**
 * Event collector: singleton ring buffer with subscription support.
 *
 * This is the central store used by the Next.js integration and DevTools UI.
 *
 * The instance is stored on `globalThis` rather than in module scope. Next.js
 * bundles each route separately on the server, so a module-level variable
 * would be duplicated per route chunk: events recorded while rendering a
 * Server Component would land in a different collector than the one the
 * debug-events route reads. Keying off `globalThis` gives every route chunk
 * a single shared collector.
 */

import {
  RingBuffer,
  type EventListener,
  type Unsubscribe,
} from "./ring-buffer.js";
import type { DebugEvent } from "./events.js";

export interface Collector {
  push(event: DebugEvent): void;
  list(): DebugEvent[];
  listRange(start: number, end: number): DebugEvent[];
  clear(): void;
  size(): number;
  capacity(): number;
  subscribe(listener: EventListener): Unsubscribe;
  destroy(): void;
}

class MemoryCollector implements Collector {
  private readonly buffer: RingBuffer;

  constructor(max?: number) {
    this.buffer = new RingBuffer({ max });
  }

  push(event: DebugEvent): void {
    this.buffer.push(event);
  }

  list(): DebugEvent[] {
    return this.buffer.list();
  }

  listRange(start: number, end: number): DebugEvent[] {
    return this.buffer.listRange(start, end);
  }

  clear(): void {
    this.buffer.clear();
  }

  size(): number {
    return this.buffer.size;
  }

  capacity(): number {
    return this.buffer.capacity;
  }

  subscribe(listener: EventListener): Unsubscribe {
    return this.buffer.subscribe(listener);
  }

  destroy(): void {
    this.buffer.destroy();
  }
}

const COLLECTOR_KEY = Symbol.for("next-rsc-debug.collector");

interface CollectorGlobal {
  [COLLECTOR_KEY]?: Collector;
}

function collectorGlobal(): CollectorGlobal {
  return globalThis as unknown as CollectorGlobal;
}

export function getCollector(): Collector {
  const store = collectorGlobal();
  if (!store[COLLECTOR_KEY]) {
    store[COLLECTOR_KEY] = new MemoryCollector();
  }
  return store[COLLECTOR_KEY];
}

export function createCollector(max?: number): Collector {
  return new MemoryCollector(max);
}

export function setCollector(collector: Collector): void {
  collectorGlobal()[COLLECTOR_KEY] = collector;
}

export function resetCollector(): void {
  const store = collectorGlobal();
  if (store[COLLECTOR_KEY]) {
    store[COLLECTOR_KEY].destroy();
    store[COLLECTOR_KEY] = undefined;
  }
}
