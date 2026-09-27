import Link from "next/link";

export default function DocsPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px" }}>
      <h1>Next RSC Debug Documentation</h1>
      <nav style={{ margin: "24px 0" }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <li>
            <Link href="/overview">Overview</Link>
          </li>
          <li>
            <Link href="/install">Installation</Link>
          </li>
          <li>
            <Link href="/setup">Setup</Link>
          </li>
          <li>
            <Link href="/playground">Playground</Link>
          </li>
          <li>
            <Link href="/privacy">Privacy</Link>
          </li>
          <li>
            <Link href="/limitations">Limitations</Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}
