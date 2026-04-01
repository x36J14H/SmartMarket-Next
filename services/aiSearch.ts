import { Product } from '../types';

const searchPromiseCache = new Map<string, Promise<Product[]>>();
const searchResultCache = new Map<string, Product[]>();

export function getCachedSearchResults(query: string): Product[] | null {
  return searchResultCache.get(query.trim().toLowerCase()) || null;
}

export async function searchProductsWithAI(query: string, products: Product[]): Promise<Product[]> {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  if (searchPromiseCache.has(normalizedQuery)) {
    return searchPromiseCache.get(normalizedQuery)!;
  }

  const searchPromise = (async () => {
    try {
      const res = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: normalizedQuery, products }),
      });

      const { ids } = await res.json();
      const matched = (ids as string[])
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is Product => p !== undefined);

      searchResultCache.set(normalizedQuery, matched);
      return matched;
    } catch {
      const fallback = products.filter(
        (p) =>
          p.name.toLowerCase().includes(normalizedQuery) ||
          p.category.toLowerCase().includes(normalizedQuery) ||
          p.brand.toLowerCase().includes(normalizedQuery)
      );
      searchResultCache.set(normalizedQuery, fallback);
      return fallback;
    }
  })();

  searchPromiseCache.set(normalizedQuery, searchPromise);
  return searchPromise;
}
