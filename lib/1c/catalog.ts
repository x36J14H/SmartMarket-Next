import { onecClient } from './client';
import type { ApiAvailabilityItem, ApiCatalogResponse, ApiCategoriesResponse, ApiProduct, ApiProductMini, ApiProductsByIdsResponse, CatalogParams } from './types';
import { Product } from '../../types';
import type { Category } from '../../store/productsStore';
import { getProductFallbackImage } from '../productMedia';

const FALLBACK_IMAGE = '/service/image-unavailable.svg';

function imageUrl(productId: string, fileId: string | undefined): string {
  if (!fileId) return '';
  // Если 1С вернул полный URL (http/https) — возвращаем как есть
  if (fileId.startsWith('http://') || fileId.startsWith('https://')) return fileId;
  return `/api/1c/catalog/${productId}/images/${fileId}`;
}

export function mapApiProduct(item: ApiProduct): Product {
  const resolvedSlug = item.slug || item.article || item.id;
  const rawImage = imageUrl(item.id, item.imageUrl);
  const fallback = getProductFallbackImage(resolvedSlug, item.name);
  const mainImage = rawImage || fallback;
  const imagesList = item.images?.length
    ? item.images.map((fid) => imageUrl(item.id, fid)).filter(Boolean)
    : [];

  return {
    id: item.id,
    slug: resolvedSlug,
    name: item.name,
    category: item.category || '',
    categorySlug: item.categorySlug || '',
    subcategory: item.subcategory || '',
    subcategorySlug: item.subcategorySlug || '',
    type: item.type || '',
    typeSlug: item.typeSlug || '',
    brand: item.brand || '',
    brandSlug: item.brandSlug || '',
    price: item.price ?? 0,
    oldPrice: item.oldPrice,
    inStock: item.inStock ?? 0,
    description: item.description || '',
    shortDescription: item.shortDescription || item.description || '',
    imageUrl: mainImage,
    images: imagesList.length > 0 ? imagesList : [mainImage],
    characteristics: {
      ...(item.article ? { Артикул: item.article } : {}),
      ...(item.characteristics || {}),
    },
    sku: item.article || item.id,
    reviewsCount: item.reviewsCount ?? 0,
    questionsCount: item.questionsCount ?? 0,
    rating: item.rating ?? 0,
    isPurchased: Boolean(item.isPurchased),
    canReview: Boolean(item.canReview),
    hasReview: Boolean(item.hasReview),
  };
}

export function mapApiCategories(apiCategories: ApiCategoriesResponse['categories']): Category[] {
  return apiCategories
    .filter((cat) => cat.subcategories?.length > 0)
    .map((cat) => ({
      name: cat.name,
      slug: cat.slug,
      groups: cat.subcategories.map((sub) => ({
        name: sub.name,
        slug: sub.slug,
        items: (sub.types || []).map((t) => ({ name: t.name, slug: t.slug })),
      })),
    }));
}

export async function fetchCatalog(params: CatalogParams = {}, signal?: AbortSignal) {
  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  if (params.brand) {
    const brands = Array.isArray(params.brand) ? params.brand : [params.brand];
    qs.set('brand', brands.join(','));
  }
  if (params.q) qs.set('q', params.q);
  if (params.slug) qs.set('slug', params.slug);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));

  const path = qs.toString() ? `catalog?${qs.toString()}` : 'catalog';

  const [catalogRes, categoriesRes] = await Promise.all([
    onecClient.get<ApiCatalogResponse>(path, signal),
    onecClient.get<ApiCategoriesResponse>('categories', signal),
  ]);

  const products = catalogRes.items.map(mapApiProduct);
  const categories = mapApiCategories(categoriesRes.categories);

  return {
    products,
    categories,
    total: catalogRes.total,
    page: catalogRes.page,
    limit: catalogRes.limit,
  };
}

// Список брендов из GET /brands
export async function fetchBrands(signal?: AbortSignal): Promise<{ name: string; slug: string }[]> {
  try {
    return await onecClient.get<{ name: string; slug: string }[]>('brands', signal);
  } catch {
    return [];
  }
}

// Находит товар по slug через GET /catalog/slug/{slug}
// Если slug выглядит как UUID — пробует GET /catalog/{id} напрямую
export async function fetchProductBySlug(slug: string, signal?: AbortSignal): Promise<Product | null> {
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const cleanSlug = decodeURIComponent(slug).trim();
  try {
    if (UUID_RE.test(cleanSlug)) {
      // Это UUID — идём напрямую в GET /catalog/{id}
      try {
        const item = await onecClient.get<ApiProduct>(`catalog/${cleanSlug}`, signal);
        if (item?.id) return mapApiProduct(item);
      } catch (e: any) {
        if (!e?.message?.includes('404')) throw e;
      }
    }
    const item = await onecClient.get<ApiProduct>(`catalog/slug/${encodeURIComponent(cleanSlug)}`, signal);
    if (item?.id) return mapApiProduct(item);

    // Fallback: пробуем как ID напрямую
    try {
      const fallbackItem = await onecClient.get<ApiProduct>(`catalog/${cleanSlug}`, signal);
      if (fallbackItem?.id) return mapApiProduct(fallbackItem);
    } catch (e: any) {
      if (!e?.message?.includes('404')) throw e;
    }

    return null;
  } catch (e: any) {
    if (signal?.aborted || e?.name === 'AbortError') return null;
    // Если 404 — товар действительно отсутствует
    if (e?.message?.includes('404')) return null;
    // При ошибке сервера (500, 502, network offline) выбрасываем ошибку для UI
    throw e;
  }
}

// Загружает полную карточку товара по id (GUID)
export async function fetchProductById(id: string, signal?: AbortSignal): Promise<Product | null> {
  try {
    const item = await onecClient.get<ApiProduct>(`catalog/${id}`, signal);
    if (!item?.id) return null;
    return mapApiProduct(item);
  } catch {
    return null;
  }
}

// Резолвит UUID → slug напрямую через 1С (для серверных роутов, минуя прокси)
export async function resolveProductSlug(id: string): Promise<string | null> {
  try {
    const baseUrl = process.env.ONEC_BASE_URL;
    const username = process.env.ONEC_USERNAME;
    const password = process.env.ONEC_PASSWORD;
    if (!baseUrl) return null;

    const credentials = Buffer.from(`${username}:${password}`).toString('base64');
    const res = await fetch(`${baseUrl}/catalog/${id}`, {
      headers: { Authorization: `Basic ${credentials}` },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const item: ApiProduct = await res.json();
    return item.slug || item.article || item.id || null;
  } catch {
    return null;
  }
}


// Пакетная проверка актуальных цен и остатков — GET /catalog/availability?ids=...
// Возвращает Map<id, { price, inStock }> для удобного поиска по id.
export async function fetchAvailability(
  ids: string[],
  signal?: AbortSignal,
): Promise<Map<string, ApiAvailabilityItem>> {
  if (ids.length === 0) return new Map();

  const result = new Map<string, ApiAvailabilityItem>();
  try {
    const items = await onecClient.get<ApiAvailabilityItem[]>(
      `catalog/availability?ids=${ids.slice(0, 200).join(',')}`,
      signal,
    );
    for (const item of items) result.set(item.id, item);
  } catch {
    // При ошибке возвращаем пустую Map — вызывающий код решает как деградировать
  }
  return result;
}

// Пакетная загрузка мини-карточек по списку UUID — POST /catalog/by-ids
// Один запрос вместо N. Используется для AI-поиска, избранного и корзины.
// Порядок результатов соответствует порядку переданных ids (сортируем на клиенте).
export async function fetchProductsByIds(
  ids: string[],
  signal?: AbortSignal,
): Promise<Product[]> {
  if (ids.length === 0) return [];

  try {
    const { items } = await onecClient.post<ApiProductsByIdsResponse>(
      'catalog/by-ids',
      { ids: ids.slice(0, 200) },
      signal,
    );

    if (items && items.length > 0) {
      // Восстанавливаем порядок как в исходном массиве ids
      const byId = new Map(items.map((item) => [item.id, item]));
      return ids
        .map((id) => byId.get(id))
        .filter((item): item is ApiProductMini => !!item)
        .map(mapApiProductMini);
    }
  } catch (err) {
    console.warn('fetchProductsByIds batch request failed, trying fallback:', err);
  }

  // Fallback: загрузка каждого товара через GET /catalog/{id}
  try {
    const products = await Promise.all(
      ids.slice(0, 50).map(async (id) => {
        try {
          const item = await onecClient.get<ApiProduct>(`catalog/${id}`, signal);
          return item ? mapApiProduct(item) : null;
        } catch {
          return null;
        }
      })
    );
    return products.filter((p): p is Product => p !== null);
  } catch {
    return [];
  }
}

function mapApiProductMini(item: ApiProductMini): Product {
  const imgUrl = imageUrl(item.id, item.imageUrl || undefined);
  return {
    id: item.id,
    slug: item.slug || item.id,
    name: item.name,
    price: item.price ?? 0,
    inStock: item.inStock ?? 0,
    imageUrl: imgUrl,
    // Поля, которых нет в мини-карточке — пустые значения
    category: '',
    categorySlug: '',
    subcategory: '',
    subcategorySlug: '',
    type: '',
    typeSlug: '',
    brand: '',
    brandSlug: '',
    description: '',
    shortDescription: '',
    images: [imgUrl],
    characteristics: {},
    sku: item.id,
  };
}
