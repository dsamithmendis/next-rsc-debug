export default function OverviewPage() {
  return (
    <article style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px" }}>
      <h1>Overview</h1>
      <p>
        Next RSC Debug is a development-focused observability and debugging toolkit
        for Next.js App Router applications. It helps you understand the
        relationship between browser navigation, RSC requests, server-side
        fetches, caching, Server Components, Server Actions, RSC payloads,
        errors, and client rendering.
      </p>
      <h2>Core principle</h2>
      <blockquote>
        &ldquo;Don&rsquo;t merely show events. Explain what happened and why.&rdquo;
      </blockquote>
    </article>
  );
}