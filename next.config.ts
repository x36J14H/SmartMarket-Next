import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/1c-api/:path*',
        destination: 'http://localhost:8080/1c-api/:path*',
      },
    ];
  },
};

export default nextConfig;
