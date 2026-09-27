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
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Slow Request</h1>
      <p className="text-gray-400 mb-6">
        This page performs a fetch that takes 800ms. The DevTools should flag
        this as a slow request.
      </p>
      <pre className="bg-gray-900 p-4 rounded-lg border border-gray-800 text-sm overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  );
}
