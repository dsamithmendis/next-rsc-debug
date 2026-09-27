export default function SetupPage() {
  return (
    <article style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px" }}>
      <h1>Setup</h1>
      <h2>1. Create instrumentation.ts</h2>
      <pre style={{ background: "#1a1a1a", padding: 16, borderRadius: 8, overflow: "auto" }}>
        <code>{`export async function register() {
  if (process.env.NEXT_RSC_DEBUG === "1") {
    const { register } = await import("next-rsc-debug/server");
    await register();
  }
}`}</code>
      </pre>
      <h2>2. Enable debugging</h2>
      <pre style={{ background: "#1a1a1a", padding: 16, borderRadius: 8, overflow: "auto" }}>
        <code>NEXT_RSC_DEBUG=1</code>
      </pre>
      <h2>3. Visit the dashboard</h2>
      <p>Open <code>/__next-rsc-debug</code> in your app.</p>
    </article>
  );
}