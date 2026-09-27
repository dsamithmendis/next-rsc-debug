import Link from "next/link";

export default function Home() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px" }}>
      <h1>Basic Fetch Example</h1>
      <p>
        This example performs a single server-side fetch. Run it with{" "}
        <code>NEXT_RSC_DEBUG=1 pnpm dev</code> and open{" "}
        <Link href="/__next-rsc-debug">the DevTools dashboard</Link> to watch the
        request appear in the timeline.
      </p>
    </main>
  );
}