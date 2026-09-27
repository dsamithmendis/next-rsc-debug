/**
 * Instrumentation registration.
 *
 * Called from instrumentation.ts:
 *
 *   export async function register() {
 *     if (process.env.NEXT_RSC_DEBUG === "1") {
 *       const { register } = await import("next-rsc-debug/server");
 *       await register();
 *     }
 *   }
 */

import {
  wrapFetch,
  unwrapFetch,
  isFetchInstrumented,
} from "./fetch-instrument";
import { getAdapter } from "./adapter";

export interface RegisterOptions {
  env?: string;
  wrapFetch?: boolean;
}

let isRegistered = false;

export async function register(options: RegisterOptions = {}): Promise<void> {
  if (isRegistered) {
    return;
  }

  const env = options.env ?? process.env.NEXT_RSC_DEBUG ?? "0";
  if (env !== "1") {
    return;
  }

  const adapter = getAdapter();

  if (options.wrapFetch !== false && adapter.supports.fetchHook) {
    wrapFetch();
  }

  isRegistered = true;
}

export function unregister(): void {
  if (!isRegistered) {
    return;
  }
  unwrapFetch();
  isRegistered = false;
}

export function isRegistered_(): boolean {
  return isRegistered;
}

export function isDebuggingEnabled(): boolean {
  return process.env.NEXT_RSC_DEBUG === "1";
}
