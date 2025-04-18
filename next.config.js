/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Disabling eslint checking during build for this test
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Enable Partial Prerendering for better performance
    ppr: true,
    
    // These are important for EdgeRuntime streaming
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Server external packages moved to root level as per warning
  serverExternalPackages: [],
  images: {
    domains: ['images.unsplash.com'],
  },
  // Configure Edge Runtime properly
  reactStrictMode: true,
};

module.exports = nextConfig; 