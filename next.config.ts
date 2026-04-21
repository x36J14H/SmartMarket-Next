import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 86400,
  },
  // Разрешаем доступ с локальной сети для тестирования на других устройствах
  allowedDevOrigins: [
    '192.168.56.1'
  ],
};

export default nextConfig;
