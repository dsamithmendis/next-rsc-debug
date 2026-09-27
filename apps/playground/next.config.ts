import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Folders prefixed with "_" are private in the App Router and are not
  // routable, so the dashboard lives at /rsc-debug and the documented
  // /__next-rsc-debug URL is rewritten onto it.
  async rewrites() {
    return [{ source: "/__next-rsc-debug", destination: "/rsc-debug" }];
  },
};

export default nextConfig;
