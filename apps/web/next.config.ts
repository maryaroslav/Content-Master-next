import type { NextConfig } from 'next';
import { serverEnv } from '@cm/env';

const { API_ORIGIN } = serverEnv();

const nextConfig: NextConfig = {
  typedRoutes: true,
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
  async rewrites() {
    return [
      { source: '/api/v1/:path*', destination: `${API_ORIGIN}/api/v1/:path*` },
      { source: '/uploads/:path*', destination: `${API_ORIGIN}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
