import { fetchCatalog } from '../lib/1c/catalog';
import type { Product } from '../types';

const MAX_CACHE_SIZE = 50;
const searchResultCache = new Map<string, { products: Product[]; total: number }>();

function addToCache(key: string, value: { products: Product[]; total: number }) {
  if (searchResultCache.size >= MAX_CACHE_SIZE) {
    const firstKey = searchResultCache.keys().next().value;
    if (firstKey) searchResultCache.delete(firstKey);
  }
  searchResultCache.set(key, value);
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

  // Пробуем семантический поиск
  try {
    const res = await fetch('/api/ai-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: normalizedQuery, limit }),
      signal,
    });

    if (res.ok) {
      const { ids } = await res.json() as { ids: string[] };

      if (ids.length > 0) {
        // Грузим товары по ids через каталог (текстовый поиск по каждому не нужен —
        // берём страницу каталога и фильтруем по полученным ids)
        const result = await fetchCatalog({ limit: 100 }, signal);
        const idSet = new Set(ids);
        // Сортируем в том же порядке что вернул AI
        const matched = ids
          .map((id) => result.products.find((p) => p.id === id))
          .filter((p): p is Product => !!p);

        const data = { products: matched, total: matched.length };
        addToCache(cacheKey, data);
        return data;
      }
    }
  } catch {
    // signal aborted или сервис недоступен — падаем на текстовый поиск
  }

  // Fallback — текстовый поиск через 1С
  const result = await fetchCatalog({ q: normalizedQuery, page, limit }, signal);
  const data = { products: result.products, total: result.total };
  addToCache(cacheKey, data);
  return data;
}
