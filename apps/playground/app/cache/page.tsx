import {
  debugComponent,
  debugCacheHit,
  debugCacheMiss,
  debugCacheInvalidate,
} from "next-rsc-debug/server";
import { headers } from "next/headers";

async function fetchWithCache() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  // Simulate cache behavior with explicit events.
  debugCacheMiss("user:1");
  const res = await fetch(`http://${host}/api/data`);
  const data = await res.json();
  debugCacheHit("user:1");
  debugCacheInvalidate("user:1");
  return data;
}

export default async function CachePage() {
  const data = await debugComponent("CachePage", fetchWithCache);

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Cache Events</h1>
      <p className="text-gray-400 mb-6">
        This page emits explicit cache hit/miss/invalidate events.
      </p>
      <pre className="bg-gray-900 p-4 rounded-lg border border-gray-800 text-sm overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  );
}
