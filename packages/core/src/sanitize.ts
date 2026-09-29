/**
 * Sanitization utilities for URLs and metadata.
 *
 * Rules:
 * - Strip query strings by default.
 * - Strip credentials embedded in URLs.
 * - Never store cookies, auth headers, request bodies, response bodies,
 *   passwords, or tokens.
 */

const SENSITIVE_QUERY_PARAMS = new Set([
  "token",
  "access_token",
  "refresh_token",
  "id_token",
  "api_key",
  "apikey",
  "secret",
  "password",
  "passwd",
  "pwd",
  "auth",
  "authorization",
  "session",
  "sessionid",
  "cookie",
  "csrf",
  "xsrf",
  "private_key",
  "client_secret",
]);

export interface SanitizeUrlOptions {
  /**
   * Keep non-sensitive query parameters instead of dropping the whole query
   * string. Use this for display and duplicate detection, where
   * `/api/items?page=1` and `/api/items?page=2` are genuinely different
   * requests. Sensitive parameters are still removed either way.
   *
   * Defaults to `false`, which strips the query string entirely — the more
   * conservative choice.
   */
  preserveQuery?: boolean;
}

/** Removes `user:password@` and `user@` prefixes from a URL. */
function stripCredentials(url: string): string {
  return url
    .replace(/^(https?:\/\/)[^:/@\s]+:[^@/\s]+@/, "$1")
    .replace(/^(https?:\/\/)[^@/\s]+@/, "$1");
}

export function sanitizeUrl(
  url: string,
  options: SanitizeUrlOptions = {},
): string {
  if (typeof url !== "string" || url.length === 0) {
    return "";
  }

  if (options.preserveQuery) {
    return stripSensitiveQueryParams(url);
  }

  let sanitized: string;

  try {
    const parsed = new URL(url);
    // Strip the query string entirely.
    parsed.search = "";
    // Strip the hash fragment.
    parsed.hash = "";
    sanitized = parsed.toString();
  } catch {
    // If the URL cannot be parsed, strip anything that looks like a query string.
    sanitized = url.split("?")[0].split("#")[0];
  }

  // Also strip credentials embedded in the URL (user:pass@host).
  return stripCredentials(sanitized);
}

export function stripSensitiveQueryParams(url: string): string {
  if (typeof url !== "string" || url.length === 0) {
    return "";
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return stripCredentials(url.split("#")[0]);
  }

  const params = parsed.searchParams;
  const sensitiveKeys: string[] = [];
  for (const key of params.keys()) {
    if (!isSafeKey(key)) {
      sensitiveKeys.push(key);
    }
  }

  if (sensitiveKeys.length === 0) {
    return stripCredentials(url.split("#")[0]);
  }

  for (const key of sensitiveKeys) {
    params.delete(key);
  }

  parsed.search = params.toString();
  parsed.hash = "";
  return stripCredentials(parsed.toString());
}

export function isSafeKey(key: string): boolean {
  if (typeof key !== "string") {
    return false;
  }
  const lower = key.toLowerCase();
  return !SENSITIVE_QUERY_PARAMS.has(lower);
}

/* -------------------------------------------------------------------------- */
/* Cache key redaction                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Deliberately narrow: only email addresses, which are high-confidence PII
 * with a distinctive shape. Attempting to also detect phone numbers, national
 * ids or opaque user ids would mangle legitimate cache keys, and a wrong guess
 * is worse than no redaction for a debugging tool. Anything beyond this is an
 * application-level decision about which identifiers are safe to log.
 */
const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

export function sanitizeKey(key: string): string {
  if (typeof key !== "string" || key.length === 0) {
    return "";
  }
  return key.replace(EMAIL_PATTERN, (match) => {
    const at = match.lastIndexOf("@");
    if (at <= 0) {
      return "[redacted]";
    }
    const local = match.slice(0, at);
    const domain = match.slice(at + 1);
    // Keep enough to correlate events about the same user without retaining
    // the address itself.
    return `${local[0]}***@${domain}`;
  });
}

/* -------------------------------------------------------------------------- */
/* Metadata sanitization                                                      */
/* -------------------------------------------------------------------------- */

const DEFAULT_MAX_DEPTH = 6;
const DEFAULT_MAX_ARRAY_ITEMS = 100;
const DEFAULT_MAX_STRING_LENGTH = 2000;

export interface SanitizeMetadataOptions {
  maxDepth?: number;
  maxArrayItems?: number;
  maxStringLength?: number;
}

interface Limits {
  maxDepth: number;
  maxArrayItems: number;
  maxStringLength: number;
}

function truncate(value: string, max: number): string {
  if (value.length <= max) {
    return value;
  }
  return `${value.slice(0, max)}… [truncated ${value.length - max} chars]`;
}

/**
 * Converts an arbitrary value into something `JSON.stringify` can always
 * handle, and that is safe to broadcast to every connected browser.
 *
 * Applied centrally in `createEvent` rather than at each call site, so that a
 * new producer cannot accidentally bypass it.
 */
function normalizeValue(
  value: unknown,
  depth: number,
  seen: WeakSet<object>,
  limits: Limits,
): unknown {
  if (value === null) {
    return null;
  }

  const type = typeof value;
  if (type === "string") {
    return truncate(value as string, limits.maxStringLength);
  }
  if (type === "boolean") {
    return value;
  }
  if (type === "number") {
    // NaN/Infinity serialize to null, which reads as "missing" downstream.
    return Number.isFinite(value as number) ? value : String(value);
  }
  if (type === "bigint") {
    // JSON.stringify throws on BigInt.
    return (value as bigint).toString();
  }
  if (type === "function" || type === "symbol" || type === "undefined") {
    return undefined;
  }

  const obj = value as object;

  // Path-scoped cycle detection: a repeated reference in a tree that is not
  // actually cyclic is fine, only a reference back into the current path.
  if (seen.has(obj)) {
    return "[Circular]";
  }
  if (depth >= limits.maxDepth) {
    return "[Max depth reached]";
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }
  if (value instanceof Error) {
    return {
      name: value.name,
      message: truncate(value.message, limits.maxStringLength),
    };
  }

  seen.add(obj);
  try {
    if (Array.isArray(value)) {
      const items: unknown[] = [];
      for (const item of value.slice(0, limits.maxArrayItems)) {
        const normalized = normalizeValue(item, depth + 1, seen, limits);
        items.push(normalized === undefined ? null : normalized);
      }
      if (value.length > limits.maxArrayItems) {
        items.push(`[${value.length - limits.maxArrayItems} more items]`);
      }
      return items;
    }
    if (value instanceof Map) {
      return normalizeValue(Object.fromEntries(value), depth, seen, limits);
    }
    if (value instanceof Set) {
      return normalizeValue([...value], depth, seen, limits);
    }
    return normalizeRecord(
      value as Record<string, unknown>,
      depth,
      seen,
      limits,
    );
  } finally {
    seen.delete(obj);
  }
}

function normalizeRecord(
  source: Record<string, unknown>,
  depth: number,
  seen: WeakSet<object>,
  limits: Limits,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(source)) {
    // Applied at every level, so `{ user: { token: "…" } }` is cleaned too.
    if (!isSafeKey(key)) {
      continue;
    }
    const value = normalizeValue(raw, depth + 1, seen, limits);
    if (value === undefined) {
      continue;
    }
    out[key] = value;
  }
  return out;
}

/**
 * Strips sensitive keys and makes every remaining value JSON-safe.
 *
 * Guards two failure modes at once:
 *   - leakage: an auth token handed to `debugCacheHit()` would otherwise be
 *     persisted and streamed to every connected client
 *   - serialization: a circular reference or BigInt in metadata would throw in
 *     `JSON.stringify` and break the SSE stream
 */
export function sanitizeMetadata(
  metadata: Record<string, unknown> | undefined,
  options: SanitizeMetadataOptions = {},
): Record<string, unknown> | undefined {
  if (metadata === undefined || metadata === null) {
    return undefined;
  }
  if (typeof metadata !== "object" || Array.isArray(metadata)) {
    return undefined;
  }
  const limits: Limits = {
    maxDepth: options.maxDepth ?? DEFAULT_MAX_DEPTH,
    maxArrayItems: options.maxArrayItems ?? DEFAULT_MAX_ARRAY_ITEMS,
    maxStringLength: options.maxStringLength ?? DEFAULT_MAX_STRING_LENGTH,
  };
  // Seed the root into the cycle set. `normalizeValue` relies on the invariant
  // that the object it is about to walk is already on the path, so without this
  // a self-referencing root would be expanded one level before being caught.
  const seen = new WeakSet<object>();
  seen.add(metadata);
  return normalizeRecord(metadata, 0, seen, limits);
}
