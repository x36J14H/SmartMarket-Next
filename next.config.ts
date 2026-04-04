import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Изображения отдаются через наш прокси /api/1c/... — внутренние пути
    // Оптимизация включена, Next.js будет кешировать и конвертировать в WebP
    minimumCacheTTL: 86400,
  },
};

export default nextConfig;
