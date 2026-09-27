export default function SetupPage() {
  return (
    <article style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px" }}>
      <h1>Setup</h1>
      <h2>1. Create instrumentation.ts</h2>
      <pre
        style={{
          background: "#1a1a1a",
          padding: 16,
          borderRadius: 8,
          overflow: "auto",
        }}
      >
        <code>{`export async function register() {
  if (process.env.NEXT_RSC_DEBUG === "1") {
    const { register } = await import("next-rsc-debug/server");
    await register();
  }
}`}</code>
      </pre>
      <h2>2. Enable debugging</h2>
      <pre
        style={{
          background: "#1a1a1a",
          padding: 16,
          borderRadius: 8,
          overflow: "auto",
        }}
      >
        <code>NEXT_RSC_DEBUG=1</code>
      </pre>
      <h2>3. Add the events endpoint</h2>
      <pre
        style={{
          background: "#1a1a1a",
          padding: 16,
          borderRadius: 8,
          overflow: "auto",
        }}
      >
        <code>
          {
            '// app/api/debug-events/route.ts\nexport { GET } from "next-rsc-debug/route";'
          }
        </code>
      </pre>
      <h2>4. Mount the dashboard</h2>
      <pre
        style={{
          background: "#1a1a1a",
          padding: 16,
          borderRadius: 8,
          overflow: "auto",
        }}
      >
        <code>
          {
            '// app/rsc-debug/page.tsx\nimport { DevTools } from "@next-rsc-debug/devtools";\n\nexport default function DebugPage() {\n  return <DevTools url="/api/debug-events" />;\n}'
          }
        </code>
      </pre>
      <p>
        The DevTools package is a Client Component library, so import it
        directly. Do not wrap it in <code>next/dynamic</code> with{" "}
        <code>ssr: {"{ false }"}</code> inside a Server Component on Next.js 16.
      </p>
      <h2>5. Visit the dashboard</h2>
      <p>
        Open <code>/rsc-debug</code> in your app. Folders prefixed with an
        underscore are private in the App Router and are not routable, so avoid
        naming the folder <code>__next-rsc-debug</code> — it will return 404.
      </p>
    </article>
  );
}
