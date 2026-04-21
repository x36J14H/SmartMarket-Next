import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // fileId в 1С — неизменяемые UUID, кэшируем агрессивно
    minimumCacheTTL: 2592000, // 30 дней
  },
  // Разрешаем доступ с локальной сети для тестирования на других устройствах
  allowedDevOrigins: [
    '192.168.56.1'
  ],
};

export default nextConfig;
