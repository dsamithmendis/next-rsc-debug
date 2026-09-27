import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a fully static site (apps/docs/out) that GitHub Pages can host.
  output: "export",
  // GitHub Pages serves the project from https://<user>.github.io/<repo>/,
  // so every route and asset needs the repository name as a prefix. The Pages
  // workflow supplies this; it is empty locally so `pnpm dev` stays on "/".
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  // Pages has no rewrite engine, so real directories are required for a
  // hard refresh on a nested route to resolve instead of 404ing.
  trailingSlash: true,
  // The image optimizer is a server feature and is unavailable after export.
  images: { unoptimized: true },
};

export default nextConfig;
