import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    THEME: process.env.NEXT_PUBLIC_THEME,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/:path*`
      }
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  }
};

export default nextConfig;
