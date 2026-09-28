import "@next-rsc-debug/devtools/styles.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cache Example",
  description: "Explicit cache hit, miss, and invalidate events",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          background: "#0b0b0f",
          color: "#e5e7eb",
          margin: 0,
        }}
      >
        {children}
      </body>
    </html>
  );
}
