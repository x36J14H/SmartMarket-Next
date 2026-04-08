import { fetchCatalog } from '../lib/1c/catalog';
import type { Product } from '../types';

// Ограничиваем кэш — не более 50 запросов
const MAX_CACHE_SIZE = 50;
const searchResultCache = new Map<string, { products: Product[]; total: number }>();

function addToCache(key: string, value: { products: Product[]; total: number }) {
  if (searchResultCache.size >= MAX_CACHE_SIZE) {
    const firstKey = searchResultCache.keys().next().value;
    if (firstKey) searchResultCache.delete(firstKey);
  }
  searchResultCache.set(key, value);
}

export function getCachedSearchResults(query: string): { products: Product[]; total: number } | null {
  return searchResultCache.get(query.trim().toLowerCase()) ?? null;
}

export async function searchProducts(
  query: string,
  page = 1,
  limit = 20,
  signal?: AbortSignal
): Promise<{ products: Product[]; total: number }> {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return { products: [], total: 0 };

  const cacheKey = `${normalizedQuery}:${page}:${limit}`;
  const cached = searchResultCache.get(cacheKey);
  if (cached) return cached;

  const result = await fetchCatalog({ q: normalizedQuery, page, limit }, signal);
  const data = { products: result.products, total: result.total };
  addToCache(cacheKey, data);
  return data;
}
