import Link from "next/link";

export default function Home() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px" }}>
      <h1>Cache Example</h1>
      <p>
        This example records explicit cache events — hits, misses, and
        invalidations. Run it with <code>NEXT_RSC_DEBUG=1 pnpm dev</code> and
        open <Link href="/__next-rsc-debug">the DevTools dashboard</Link> to see
        them on the timeline.
      </p>
      <ul>
        <li>
          <Link href="/cache">Cache hit, miss, and invalidate</Link>
        </li>
        <li>
          <Link href="/__next-rsc-debug">DevTools dashboard</Link>
        </li>
      </ul>
    </main>
  );
}
