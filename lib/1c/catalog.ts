import { onecClient } from './client';
import type { ApiCatalogResponse, ApiCategoriesResponse, ApiProduct } from './types';
import type { Product } from '../../types';
import type { Category } from '../../store/productsStore';

const FALLBACK_IMAGE = '/service/image-unavailable.png';

function imageUrl(productId: string, fileId: string | undefined): string {
  if (!fileId) return FALLBACK_IMAGE;
  return `/api/1c/catalog/${productId}/images/${fileId}`;
}

export function mapApiProduct(item: ApiProduct): Product {
  const mainImage = imageUrl(item.id, item.imageUrl);
  return {
    id: item.id,
    slug: item.slug || item.article || item.id,
    name: item.name,
    category: item.category || '',
    subcategory: item.subcategory || '',
    type: item.type || '',
    brand: item.brand || '',
    price: item.price ?? 0,
    oldPrice: item.oldPrice,
    description: item.description || '',
    shortDescription: item.shortDescription || item.description || '',
    imageUrl: mainImage,
    images: item.images?.length
      ? item.images.map((fid) => imageUrl(item.id, fid))
      : [mainImage],
    characteristics: {
      ...(item.article ? { Артикул: item.article } : {}),
      ...(item.characteristics || {}),
    },
    sku: item.article || item.id,
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

export async function fetchCatalog(signal?: AbortSignal) {
  const [catalogRes, categoriesRes] = await Promise.all([
    onecClient.get<ApiCatalogResponse>('catalog', signal),
    onecClient.get<ApiCategoriesResponse>('categories', signal),
  ]);

  const products = catalogRes.items.map(mapApiProduct);
  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))] as string[];
  const categories = mapApiCategories(categoriesRes.categories);

  return { products, brands, categories };
}

export async function fetchProductDetail(id: string, signal?: AbortSignal): Promise<Partial<Product>> {
  const item = await onecClient.get<ApiProduct>(`catalog/${id}`, signal);
  const mainImage = imageUrl(item.id, item.imageUrl);
  return {
    type: item.type || '',
    brand: item.brand || '',
    subcategory: item.subcategory || '',
    description: item.description || '',
    shortDescription: item.shortDescription || item.description || '',
    ...(item.imageUrl ? { imageUrl: mainImage } : {}),
    ...(item.images?.length ? { images: item.images.map((fid) => imageUrl(item.id, fid)) } : {}),
    characteristics: {
      ...(item.article ? { Артикул: item.article } : {}),
      ...(item.characteristics || {}),
    },
  };
}
