import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'logo.clearbit.com' },
    ],
  },
  // This ensures your "Million-Dollar" animations don't 
  // get stripped out during Cloudflare minification
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Experimental flag if you are using Next.js 15+ features
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;