import { debugComponent } from "next-rsc-debug/server";
import { headers } from "next/headers";

async function fetchSlow() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const res = await fetch(`http://${host}/api/slow?delay=800`);
  return res.json();
}

export default async function SlowPage() {
  const data = await debugComponent("SlowPage", fetchSlow);

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px" }}>
      <h1>Slow Request</h1>
      <p>
        This fetch takes 800ms, so it exceeds the default 500ms threshold and is
        flagged as a slow request in the Warnings panel.
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