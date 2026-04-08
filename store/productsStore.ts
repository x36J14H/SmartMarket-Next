import { create } from 'zustand';
import { Product } from '../types';
import { fetchCatalog } from '../lib/1c/catalog';

// Re-export типов для обратной совместимости
export type { ApiProduct, ApiCategory } from '../lib/1c/types';

export type CategoryItem  = { name: string; slug: string };
export type CategoryGroup = { name: string; slug: string; items: CategoryItem[] };
export type Category      = { name: string; slug: string; groups: CategoryGroup[] };

interface ProductsState {
  products: Product[];
  categories: Category[];
  brands: string[];
  loading: boolean;
  error: string | null;
  loaded: boolean;
  fetchProducts: () => Promise<void>;
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  categories: [],
  brands: [],
  loading: false,
  error: null,
  loaded: false,

  fetchProducts: async () => {
    if (get().loaded) return;
    set({ loading: true, error: null });
    try {
      const { products, brands, categories } = await fetchCatalog();
      set({ products, brands, categories, loading: false, loaded: true });
    } catch (e) {
      set({ error: (e as Error).message, loading: false, loaded: true, categories: [] });
    }
  },
}));
