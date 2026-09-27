import Link from "next/link";

export default function Home() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px" }}>
      <h1>Slow Request Example</h1>
      <p>
        This example performs a deliberately slow server-side fetch that trips
        the default 500ms slow-request warning. Run it with{" "}
        <code>NEXT_RSC_DEBUG=1 pnpm dev</code> and open{" "}
        <Link href="/__next-rsc-debug">the DevTools dashboard</Link>.
      </p>
      <ul>
        <li>
          <Link href="/slow">Slow fetch (800ms)</Link>
        </li>
        <li>
          <Link href="/__next-rsc-debug">DevTools dashboard</Link>
        </li>
      </ul>
    </main>
  );
}