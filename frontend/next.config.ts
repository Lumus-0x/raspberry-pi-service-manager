import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    THEME: process.env.NEXT_PUBLIC_THEME,
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return [
      {
        source: '/api/login',
        destination: `${apiUrl}/login`
      },
      {
        source: '/api/auth/verify',
        destination: `${apiUrl}/auth/verify`
      },
      {
        source: '/api/services/:path*',
        destination: `${apiUrl}/services/:path*`
      },
      {
        source: '/api/services/create',
        destination: `${apiUrl}/services/create`
      },
      {
        source: '/api/services/control',
        destination: `${apiUrl}/services/control`
      },
      {
        source: '/api/services/delete',
        destination: `${apiUrl}/services/delete`
      },
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
