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
        <li>Cloud dashboard</li>
        <li>AI explanations</li>
      </ul>
      <h2>No browser extension is required &mdash; or planned</h2>
      <p>
        This is a deliberate architectural choice, not a gap. Next RSC Debug
        renders its dashboard as an ordinary page{" "}
        <em>inside your own application</em>, so there is nothing to install and
        nothing to grant.
      </p>
      <p>
        The toolkit never reaches into the browser. It registers server-side
        instrumentation through <code>instrumentation.ts</code>, wraps the
        server&rsquo;s <code>fetch</code>, records events into an in-memory
        buffer in your Node process, and streams them to the dashboard over an
        SSE route handler. The UI is a normal React client component that you
        mount at a page of your choosing.
      </p>
      <p>That design has some practical consequences:</p>
      <ul>
        <li>
          Nothing is injected into pages you do not own, and there are no
          content scripts, browser permissions, or per-site allowlists
        </li>
        <li>
          It is browser-agnostic &mdash; not tied to Chrome or any single engine
        </li>
        <li>
          The data is inspectable without a browser at all, since{" "}
          <code>/api/debug-events</code> is a plain JSON endpoint you can curl
        </li>
        <li>It can run in CI or a container with no browser installed</li>
        <li>
          All state stays in your process; there is no telemetry and nothing
          leaves the machine
        </li>
      </ul>
      <p>
        A browser extension appears on the roadmap only as an optional
        convenience for people who would like the dashboard docked in the
        DevTools panel. The in-page UI is the supported interface.
      </p>
    </article>
  );
}
