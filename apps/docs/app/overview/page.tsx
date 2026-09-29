export default function OverviewPage() {
  return (
    <article style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px" }}>
      <h1>Overview</h1>
      <p>
        Next RSC Debug is a development-focused observability and debugging
        toolkit for Next.js App Router applications. It helps you understand the
        relationship between browser navigation, RSC requests, server-side
        fetches, caching, Server Components, Server Actions, RSC payloads,
        errors, and client rendering.
      </p>
      <h2>Core principle</h2>
      <blockquote>
        &ldquo;Don&rsquo;t merely show events. Explain what happened and
        why.&rdquo;
      </blockquote>
      <h2>No browser extension</h2>
      <p>
        The dashboard is a normal page inside your own application, mounted
        wherever you like (by default <code>/rsc-debug</code>). There is no
        extension to install, no browser permissions to grant, and nothing is
        injected into the browser.
      </p>
      <p>The whole pipeline runs on your server and your own routes:</p>
      <ol>
        <li>
          <code>instrumentation.ts</code> calls <code>register()</code>, which
          wraps the server&rsquo;s <code>fetch</code>
        </li>
        <li>
          Producers such as <code>debugComponent()</code> and{" "}
          <code>debugCacheHit()</code> record events into an in-memory ring
          buffer held on <code>globalThis</code> in the Node process
        </li>
        <li>
          A route handler you mount yourself serves that buffer as JSON and as a
          live SSE stream
        </li>
        <li>
          <code>&lt;DevTools /&gt;</code> — an ordinary React client component —
          subscribes and renders the timeline
        </li>
      </ol>
      <p>
        Because the data source is a plain endpoint, you can also inspect it
        with <code>curl</code>, assert on it in CI, or run it in a container
        with no browser installed. See <a href="./limitations">Limitations</a>{" "}
        for why an extension is not planned.
      </p>
    </article>
  );
}
