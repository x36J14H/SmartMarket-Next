import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  // В dev-режиме SW не регистрируем, чтобы не мешал hot reload
  disable: process.env.NODE_ENV === 'development',
  register: true,
  // Кэшируем стартовый URL
  cacheStartUrl: true,
  // Кэшируем навигацию на фронте
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  // Переиспользуем SW без ожидания
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  images: {
    // fileId в 1С — неизменяемые UUID, кэшируем агрессивно
    minimumCacheTTL: 2592000, // 30 дней
    // Разрешаем SVG для fallback-изображений
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Разрешаем доступ с локальной сети для тестирования на других устройствах
  allowedDevOrigins: [
    '192.168.56.1'
  ],
  // next-pwa использует webpack — явно указываем пустой turbopack конфиг
  // чтобы Next.js 16 не выдавал ошибку о конфликте
  turbopack: {},
};

export default withPWA(nextConfig);
