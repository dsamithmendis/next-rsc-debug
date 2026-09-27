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

export function sanitizeUrl(url: string): string {
  if (typeof url !== "string" || url.length === 0) {
    return "";
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
  sanitized = sanitized.replace(/^(https?:\/\/)[^:/@\s]+:[^@/\s]+@/, "$1");
  // Remove userinfo entirely if present (user@host without password).
  sanitized = sanitized.replace(/^(https?:\/\/)[^@/\s]+@/, "$1");

  return sanitized;
}

export function stripSensitiveQueryParams(url: string): string {
  if (typeof url !== "string" || url.length === 0) {
    return "";
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url.split("#")[0];
  }

  const params = parsed.searchParams;
  const sensitiveKeys: string[] = [];
  for (const key of params.keys()) {
    if (SENSITIVE_QUERY_PARAMS.has(key.toLowerCase())) {
      sensitiveKeys.push(key);
    }
  }

  if (sensitiveKeys.length === 0) {
    return url.split("#")[0];
  }

  for (const key of sensitiveKeys) {
    params.delete(key);
  }

  parsed.search = params.toString();
  parsed.hash = "";
  return parsed.toString();
}

export function isSafeKey(key: string): boolean {
  if (typeof key !== "string") {
    return false;
  }
  const lower = key.toLowerCase();
  return !SENSITIVE_QUERY_PARAMS.has(lower);
}
