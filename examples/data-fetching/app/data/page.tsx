import {
  debugComponent,
  debugCacheHit,
  debugCacheMiss,
  debugCacheInvalidate,
} from "next-rsc-debug/server";
import { headers } from "next/headers";

async function fetchData() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";

  const users = await fetch(`http://${host}/api/data`).then((r) => r.json());
  debugCacheMiss("users");
  debugCacheHit("users");

  const posts = await fetch(`http://${host}/api/data`).then((r) => r.json());
  debugCacheMiss("posts");
  debugCacheHit("posts");
  debugCacheInvalidate("posts");

  return { users, posts };
}

export default async function DataPage() {
  const data = await debugComponent("DataPage", fetchData);

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px" }}>
      <h1>Data Fetching</h1>
      <p>
        Two sequential server-side fetches with explicit cache miss/hit events,
        ending in an invalidation.
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
