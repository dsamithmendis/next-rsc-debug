import { debugComponent } from "next-rsc-debug/server";
import { headers } from "next/headers";

async function fetchParallel() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const [users, posts, comments] = await Promise.all([
    fetch(`http://${host}/api/data`),
    fetch(`http://${host}/api/hello`),
    fetch(`http://${host}/api/data`),
  ]);
  return {
    users: await users.json(),
    posts: await posts.json(),
    comments: await comments.json(),
  };
}

export default async function ParallelPage() {
  const data = await debugComponent("ParallelPage", fetchParallel);

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Parallel Fetch</h1>
      <p className="text-gray-400 mb-6">
        This page issues three fetches concurrently. Watch the timeline.
      </p>
      <pre className="bg-gray-900 p-4 rounded-lg border border-gray-800 text-sm overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  );
}