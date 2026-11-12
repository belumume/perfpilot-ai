/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // Partial Prerendering (was experimental.ppr on the Next.js 15 canary)
  cacheComponents: true,
  images: {
    domains: ['images.unsplash.com'],
  },
};

export default nextConfig; 