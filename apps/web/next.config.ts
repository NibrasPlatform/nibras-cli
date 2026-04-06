import type { NextConfig } from 'next';
import path from 'path';

const apiBaseUrl = process.env.NEXT_PUBLIC_NIBRAS_API_BASE_URL ?? 'http://localhost:4848';

const nextConfig: NextConfig = {
  output: 'standalone',
  // Required for monorepo standalone builds to correctly trace and bundle
  // workspace dependencies from the repo root. Moved out of experimental in Next.js 15.
  outputFileTracingRoot: path.join(__dirname, '../../'),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
    ],
  },
  // Proxy all /v1/* API calls through Next.js so session cookies are same-origin.
  // This fixes cross-domain cookie issues between nibras-web.fly.dev and nibras-api.fly.dev.
  async rewrites() {
    return [
      {
        source: '/v1/:path*',
        destination: `${apiBaseUrl}/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
