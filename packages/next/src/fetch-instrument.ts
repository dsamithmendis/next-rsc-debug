/**
 * Server-side fetch instrumentation.
 *
 * Wraps globalThis.fetch to observe server-side requests.
 * - Records fetch:start / fetch:end
 * - Sanitizes URLs
 * - Does NOT record bodies, cookies, or auth headers
 * - Emits error events on failure while preserving original behavior
 */

import {
  createEvent,
  createRequestId,
  sanitizeUrl,
  getCollector,
  type DebugEvent,
} from "@next-rsc-debug/core";

export interface FetchMetadata {
  method: string;
  url: string;
  status?: number;
  duration?: number;
  contentLength?: number;
  requestId: string;
  error?: string;
}

let isWrapped = false;
let originalFetch: typeof fetch | null = null;

export function isFetchInstrumented(): boolean {
  return isWrapped;
}

export function wrapFetch(): void {
  if (isWrapped) {
    return;
  }

  originalFetch = globalThis.fetch.bind(globalThis);
  isWrapped = true;

  globalThis.fetch = async (input: any, init?: any) => {
    const collector = getCollector();

    // Extract URL and method safely.
    let url: string;
    let method = "GET";

    if (typeof input === "string") {
      url = input;
    } else if (input instanceof URL) {
      url = input.toString();
    } else if (input && typeof input.url === "string") {
      url = input.url;
    } else {
      url = String(input);
    }

    if (init && typeof init.method === "string") {
      method = init.method.toUpperCase();
    } else if (input && typeof input.method === "string") {
      method = input.method.toUpperCase();
    }

    const sanitizedUrl = sanitizeUrl(url);
    const requestId = createRequestId();

    const startEvent = createEvent({
      type: "fetch:start",
      requestId,
      metadata: {
        method,
        url: sanitizedUrl,
        originalUrl: sanitizedUrl,
        observed: true,
      },
    });
    collector.push(startEvent);

    const startTime = Date.now();

    try {
      const response = await originalFetch!(input, init);
      const duration = Date.now() - startTime;

      // Extract content-length safely.
      let contentLength: number | undefined;
      try {
        const header = response.headers.get("content-length");
        if (header) {
          const parsed = Number.parseInt(header, 10);
          if (Number.isFinite(parsed)) {
            contentLength = parsed;
          }
        }
      } catch {
        // Ignore header access errors.
      }

      const endEvent = createEvent({
        type: "fetch:end",
        requestId,
        duration,
        metadata: {
          method,
          url: sanitizedUrl,
          status: response.status,
          contentLength,
          observed: true,
          ok: response.ok,
        },
      });
      collector.push(endEvent);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      const errorEvent = createEvent({
        type: "error",
        requestId,
        duration,
        metadata: {
          method,
          url: sanitizedUrl,
          message: errorMessage,
          observed: true,
          phase: "fetch",
        },
      });
      collector.push(errorEvent);

      // Re-throw to preserve original behavior.
      throw error;
    }
  };
}

export function unwrapFetch(): void {
  if (!isWrapped || !originalFetch) {
    return;
  }
  globalThis.fetch = originalFetch;
  isWrapped = false;
  originalFetch = null;
}