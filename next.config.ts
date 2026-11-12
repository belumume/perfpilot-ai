// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Partial Prerendering (was experimental.ppr on the Next.js 15 canary)
  cacheComponents: true,
};

export default nextConfig;