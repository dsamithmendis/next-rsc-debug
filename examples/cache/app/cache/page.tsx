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
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px" }}>
      <h1>Cache Events</h1>
      <p>
        This page emits an explicit cache miss, hit, and invalidate for{" "}
        <code>user:1</code>, then performs the fetch.
      </p>
      <pre
        style={{
          background: "#111827",
          border: "1px solid #1f2937",
          borderRadius: 8,
          padding: 16,
          overflow: "auto",
        }}
      >
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  );
}
