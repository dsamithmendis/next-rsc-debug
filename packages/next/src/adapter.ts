/**
 * Next.js version detection and adapter architecture.
 *
 * Adapters isolate Next.js-specific behavior behind a stable interface.
 * If a feature cannot be implemented safely with public APIs, the adapter
 * returns a fallback and marks the capability as limited.
 */

import { createRequire } from "node:module";

export interface NextVersion {
  major: number;
  minor: number;
  patch: number;
  raw: string;
}

export interface NextAdapter {
  version: NextVersion;
  supports: {
    instrumentationRegister: boolean;
    fetchHook: boolean;
    rscRequestTracking: "observed" | "inferred" | "unavailable";
    cacheTracking: "observed" | "inferred" | "unavailable";
  };
}

function parseVersion(version: string): NextVersion {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) {
    return { major: 0, minor: 0, patch: 0, raw: version };
  }
  return {
    major: Number.parseInt(match[1], 10),
    minor: Number.parseInt(match[2], 10),
    patch: Number.parseInt(match[3], 10),
    raw: version,
  };
}

export function detectNextVersion(): NextVersion {
  try {
    const require = createRequire(import.meta.url);
    const pkg = require("next/package.json");
    return parseVersion(pkg.version);
  } catch {
    return { major: 0, minor: 0, patch: 0, raw: "unknown" };
  }
}

export function createAdapter(version: NextVersion): NextAdapter {
  const supports = {
    instrumentationRegister: version.major >= 14,
    fetchHook: true,
    rscRequestTracking: "inferred" as const,
    cacheTracking: "unavailable" as const,
  };

  return {
    version,
    supports,
  };
}

export function getAdapter(): NextAdapter {
  return createAdapter(detectNextVersion());
}