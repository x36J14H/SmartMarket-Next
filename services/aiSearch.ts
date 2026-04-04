import { Product } from '../types';

// Ограничиваем кэш — не более 50 запросов
const MAX_CACHE_SIZE = 50;
const searchResultCache = new Map<string, Product[]>();

function addToCache(key: string, value: Product[]) {
  if (searchResultCache.size >= MAX_CACHE_SIZE) {
    const firstKey = searchResultCache.keys().next().value;
    if (firstKey) searchResultCache.delete(firstKey);
  }
  searchResultCache.set(key, value);
}

export function getCachedSearchResults(query: string): Product[] | null {
  return searchResultCache.get(query.trim().toLowerCase()) ?? null;
}

export async function searchProductsWithAI(query: string, products: Product[]): Promise<Product[]> {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  if (searchResultCache.has(normalizedQuery)) {
    return searchResultCache.get(normalizedQuery)!;
  }

  try {
    // Передаём только минимальные поля, не весь объект
    const simplified = products.map((p) => ({ id: p.id, name: p.name, category: p.category, brand: p.brand }));
    const res = await fetch('/api/ai-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: normalizedQuery, products: simplified }),
    });

    const { ids } = await res.json();
    const matched = (ids as string[])
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => p !== undefined);

    addToCache(normalizedQuery, matched);
    return matched;
  } catch {
    const fallback = products.filter(
      (p) =>
        p.name.toLowerCase().includes(normalizedQuery) ||
        p.category.toLowerCase().includes(normalizedQuery) ||
        p.brand.toLowerCase().includes(normalizedQuery)
    );
    addToCache(normalizedQuery, fallback);
    return fallback;
  }
}
