/**
 * DebugEvent types and factories for Next RSC Debug.
 *
 * Every event has a unique ID, timestamp, and type.
 * Optional fields: duration, requestId, parentId, metadata.
 */

export type DebugEventType =
  | "navigation:start"
  | "navigation:end"
  | "rsc:start"
  | "rsc:end"
  | "fetch:start"
  | "fetch:end"
  | "cache:hit"
  | "cache:miss"
  | "cache:invalidate"
  | "action:start"
  | "action:end"
  | "error";

export interface DebugEvent {
  id: string;
  type: DebugEventType;
  timestamp: number;
  duration?: number;
  requestId?: string;
  parentId?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateEventOptions {
  type: DebugEventType;
  requestId?: string;
  parentId?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
}

let idCounter = 0;
let lastTimestamp = 0;

function generateId(prefix: string): string {
  // Use a combination of timestamp, counter, and random for uniqueness.
  const now = Date.now();
  if (now === lastTimestamp) {
    idCounter += 1;
  } else {
    idCounter = 0;
    lastTimestamp = now;
  }
  const random = Math.floor(Math.random() * 1_000_000);
  return `${prefix}_${now}_${idCounter}_${random}`;
}

export function createRequestId(): string {
  return generateId("req");
}

export function createNavigationId(): string {
  return generateId("nav");
}

export function createEventId(prefix: string): string {
  return generateId(prefix);
}

export function createEvent(options: CreateEventOptions): DebugEvent {
  const event: DebugEvent = {
    id: generateId(options.type.replace(/:/g, "_")),
    type: options.type,
    timestamp: Date.now(),
  };
  if (options.requestId !== undefined) {
    event.requestId = options.requestId;
  }
  if (options.parentId !== undefined) {
    event.parentId = options.parentId;
  }
  if (options.duration !== undefined) {
    event.duration = options.duration;
  }
  if (options.metadata !== undefined) {
    event.metadata = options.metadata;
  }
  return event;
}