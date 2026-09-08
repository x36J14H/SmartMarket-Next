import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  // В dev-режиме SW не регистрируем, чтобы не мешал hot reload
  disable: process.env.NODE_ENV === 'development',
  register: true,
  // Не кэшируем навигацию агрессивно, чтобы пользователи всегда получали актуальные страницы
  cacheStartUrl: false,
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,
  // Переиспользуем SW сразу при обновлении
  reloadOnOnline: false,
  workboxOptions: {
    disableDevLogs: true,
    skipWaiting: true,
    clientsClaim: true,
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
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
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
