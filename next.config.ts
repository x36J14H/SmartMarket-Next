import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    proxyTimeout: 5000,
  },
};

export default nextConfig;
