/**
 * Event collector: singleton ring buffer with subscription support.
 *
 * This is the central store used by the Next.js integration and DevTools UI.
 */

import { RingBuffer, type EventListener, type Unsubscribe } from "./ring-buffer";
import type { DebugEvent } from "./events";

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

let globalCollector: Collector | null = null;

export function getCollector(): Collector {
  if (!globalCollector) {
    globalCollector = new MemoryCollector();
  }
  return globalCollector;
}

export function createCollector(max?: number): Collector {
  return new MemoryCollector(max);
}

export function setCollector(collector: Collector): void {
  globalCollector = collector;
}

export function resetCollector(): void {
  if (globalCollector) {
    globalCollector.destroy();
  }
  globalCollector = null;
}