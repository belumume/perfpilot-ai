/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Partial Prerendering (was experimental.ppr on the Next.js 15 canary)
  cacheComponents: true,
  images: {
    domains: ['images.unsplash.com'],
  },
};

module.exports = nextConfig; 