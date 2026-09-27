import Link from "next/link";

export default function Home() {
  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Next RSC Debug Playground</h1>
      <p className="text-gray-400 mb-8">
        A demonstration app for Next RSC Debug. Open{" "}
        <Link
          href="/rsc-debug"
          className="bg-gray-800 px-2 py-1 rounded text-blue-400 hover:text-blue-300"
        >
          /rsc-debug
        </Link>{" "}
        to inspect activity.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ScenarioCard
          href="/basic"
          title="Basic Fetch"
          description="A simple server-side fetch to /api/hello"
        />
        <ScenarioCard
          href="/slow"
          title="Slow Request"
          description="A fetch that takes 800ms — triggers slow-request warning"
        />
        <ScenarioCard
          href="/duplicate"
          title="Duplicate Fetch"
          description="Two fetches to the same URL — triggers duplicate warning"
        />
        <ScenarioCard
          href="/parallel"
          title="Parallel Fetch"
          description="Multiple fetches issued concurrently"
        />
        <ScenarioCard
          href="/error"
          title="Error Handling"
          description="A fetch that fails — triggers error event"
        />
        <ScenarioCard
          href="/cache"
          title="Cache Events"
          description="Explicit cache hit/miss/invalidate events"
        />
      </div>

      <div className="mt-8 p-4 bg-gray-900 rounded-lg border border-gray-800">
        <h2 className="font-semibold mb-2">How to use</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
          <li>Start the dev server: <code className="bg-gray-800 px-1 rounded">pnpm dev</code></li>
          <li>Visit any scenario page</li>
          <li>
            Open{" "}
            <Link
              href="/rsc-debug"
              className="bg-gray-800 px-1 rounded text-blue-400 hover:text-blue-300"
            >
              /rsc-debug
            </Link>
          </li>
          <li>Watch events stream live via SSE</li>
        </ol>
      </div>
    </main>
  );
}

function ScenarioCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-blue-600 hover:bg-gray-800 transition"
    >
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-gray-400 mt-1">{description}</p>
    </Link>
  );
}