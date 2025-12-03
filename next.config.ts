import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for Netlify deployment
  output: 'standalone',

  // Image optimization (updated for Next.js 16)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // Increase timeout for API routes (investigations can take time)
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // Turbopack config (empty to silence warnings)
  turbopack: {},
};

export default nextConfig;
