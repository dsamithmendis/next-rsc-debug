import { debugComponent } from "next-rsc-debug/server";
import { headers } from "next/headers";

async function fetchError() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  try {
    const res = await fetch(`http://${host}/api/error`);
    return await res.json();
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export default async function ErrorPage() {
  const data = await debugComponent("ErrorPage", fetchError);

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Error Handling</h1>
      <p className="text-gray-400 mb-6">
        This page fetches from /api/error which returns 500. The DevTools
        should show the fetch status.
      </p>
      <pre className="bg-gray-900 p-4 rounded-lg border border-gray-800 text-sm overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  );
}