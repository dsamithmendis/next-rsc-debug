import { debugComponent } from "next-rsc-debug/server";
import { headers } from "next/headers";

async function fetchDuplicate() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  // Two fetches to the same URL — should trigger duplicate warning.
  const [a, b] = await Promise.all([
    fetch(`http://${host}/api/data`),
    fetch(`http://${host}/api/data`),
  ]);
  return { a: await a.json(), b: await b.json() };
}

export default async function DuplicatePage() {
  const data = await debugComponent("DuplicatePage", fetchDuplicate);

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Duplicate Fetch</h1>
      <p className="text-gray-400 mb-6">
        This page issues two fetches to the same URL. The DevTools should flag
        this as a duplicate request.
      </p>
      <pre className="bg-gray-900 p-4 rounded-lg border border-gray-800 text-sm overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  );
}
