import type { NextConfig } from 'next';
import { serverEnv } from '@cm/env';

const { API_ORIGIN } = serverEnv();

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5001',
        pathname: '/uploads/**',
      },
    ],
  },
  // Same-origin access to the API in development; in production the gateway routes these paths.
  // Only /api/v1 is proxied: a broader /api/* rule would run before NextAuth's dynamic /api/auth route.
  async rewrites() {
    return [
      { source: '/api/v1/:path*', destination: `${API_ORIGIN}/api/v1/:path*` },
      { source: '/uploads/:path*', destination: `${API_ORIGIN}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
