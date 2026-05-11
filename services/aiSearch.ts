import { fetchCatalog, fetchProductsByIds } from '../lib/1c/catalog';
import type { Product } from '../types';

export async function searchProducts(
  query: string,
  page = 1,
  limit = 20,
  signal?: AbortSignal
): Promise<{ products: Product[]; total: number }> {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return { products: [], total: 0 };

  // Пробуем семантический AI-поиск
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
        const products = await fetchProductsByIds(ids, signal);
        return { products, total: products.length };
      }
    }
  } catch {
    // signal aborted или сервис недоступен — падаем на текстовый поиск
  }

  // Fallback — текстовый поиск через 1С
  const result = await fetchCatalog({ q: normalizedQuery, page, limit }, signal);
  return { products: result.products, total: result.total };
}
