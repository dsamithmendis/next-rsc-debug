import { debugComponent } from "next-rsc-debug/server";
import { headers } from "next/headers";

async function fetchParallel() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";

  const [users, greeting, comments] = await Promise.all([
    fetch(`http://${host}/api/data`),
    fetch(`http://${host}/api/hello`),
    fetch(`http://${host}/api/data`),
  ]);

  return {
    users: await users.json(),
    greeting: await greeting.json(),
    comments: await comments.json(),
  };
}

export default async function ParallelPage() {
  const data = await debugComponent("ParallelPage", fetchParallel);

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px" }}>
      <h1>Parallel Fetch</h1>
      <p>
        Three fetches are issued concurrently. Watch them start together on the
        timeline.
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
