import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Basic Fetch Example",
  description: "A single server-side fetch, observed by Next RSC Debug",
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
