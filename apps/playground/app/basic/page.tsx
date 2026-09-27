import { debugComponent } from "next-rsc-debug/server";
import { headers } from "next/headers";

async function fetchData() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const res = await fetch(`http://${host}/api/hello`);
  return res.json();
}

export default async function BasicPage() {
  const data = await debugComponent("BasicPage", fetchData);

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Basic Fetch</h1>
      <p className="text-gray-400 mb-6">
        This page performs a single server-side fetch to /api/hello.
      </p>
      <pre className="bg-gray-900 p-4 rounded-lg border border-gray-800 text-sm overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  );
}