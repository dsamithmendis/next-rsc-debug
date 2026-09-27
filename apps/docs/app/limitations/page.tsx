export default function LimitationsPage() {
  return (
    <article style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px" }}>
      <h1>Limitations</h1>
      <p>v0.1 does NOT provide:</p>
      <ul>
        <li>Exact Server Component render timing</li>
        <li>Complete internal RSC tree</li>
        <li>Native Next.js cache internals</li>
        <li>Complete Server Action tracing</li>
        <li>Production observability</li>
        <li>Chrome extension</li>
        <li>Cloud dashboard</li>
        <li>AI explanations</li>
      </ul>
    </article>
  );
}
