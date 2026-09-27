import Link from "next/link";

export default function Home() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px" }}>
      <h1>Parallel Fetch Example</h1>
      <p>
        This example issues concurrent server-side fetches so you can see how
        they interleave on the timeline. Run it with{" "}
        <code>NEXT_RSC_DEBUG=1 pnpm dev</code> and open{" "}
        <Link href="/__next-rsc-debug">the DevTools dashboard</Link>.
      </p>
      <ul>
        <li>
          <Link href="/parallel">Parallel fetches</Link>
        </li>
        <li>
          <Link href="/__next-rsc-debug">DevTools dashboard</Link>
        </li>
      </ul>
    </main>
  );
}
