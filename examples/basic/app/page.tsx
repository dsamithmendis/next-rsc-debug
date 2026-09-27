import Link from "next/link";
import { debugComponent } from "next-rsc-debug/server";
import { headers } from "next/headers";

async function fetchData() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const res = await fetch(`http://${host}/api/hello`);
  return res.json();
}

export default async function Home() {
  const data = await debugComponent("Home", fetchData);

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px" }}>
      <h1>Basic Fetch Example</h1>
      <p>
        This example performs a single server-side fetch. Run it with{" "}
        <code>NEXT_RSC_DEBUG=1 pnpm dev</code> and open{" "}
        <Link href="/__next-rsc-debug">the DevTools dashboard</Link> to watch
        the request appear in the timeline.
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
