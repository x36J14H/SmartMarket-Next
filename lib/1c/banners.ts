// Сервисный слой для баннеров главной страницы, управляемых из 1С

export interface BannerData {
  id: string;
  productId: string;
  tag: string;
  title: string;
  model: string;
  subtitle: string;
  price: number;
  oldPrice: number;
  discountLabel: string;
  specs: string[];
  imageUrl: string;
  ctaPrimary: { text: string; href: string };
  ctaSecondary: { text: string; href: string };
}

export interface BannersResponse {
  banners: BannerData[];
}

function sanitizeHref(url: string | undefined): string {
  if (!url) return '/catalog';
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const parsed = new URL(url);
      return parsed.pathname + parsed.search;
    }
  } catch {
    // fallback
  }
  return url.startsWith('/') ? url : `/${url}`;
}

export async function fetchBanners(signal?: AbortSignal): Promise<BannerData[]> {
  try {
    const res = await fetch('/api/1c/banners', {
      headers: { 'Content-Type': 'application/json' },
      signal: signal ?? AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      return [];
    }

    const data: BannersResponse = await res.json();
    if (!Array.isArray(data?.banners)) return [];

    return data.banners.map((b) => ({
      ...b,
      ctaPrimary: {
        text: b.ctaPrimary?.text || 'Купить',
        href: sanitizeHref(b.ctaPrimary?.href),
      },
      ctaSecondary: {
        text: b.ctaSecondary?.text || '',
        href: b.ctaSecondary?.href ? sanitizeHref(b.ctaSecondary.href) : '',
      },
    }));
  } catch {
    // При недоступности 1С или тайм-ауте возвращаем пустой список
    return [];
  }
}