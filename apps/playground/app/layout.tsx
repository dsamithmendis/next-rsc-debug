import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next RSC Debug Playground",
  description: "Playground demonstrating Next RSC Debug scenarios",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}