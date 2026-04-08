import { create } from 'zustand';
import { fetchCatalog, fetchBrands } from '../lib/1c/catalog';

export type { ApiProduct, ApiCategory } from '../lib/1c/types';

export type CategoryItem  = { name: string; slug: string };
export type CategoryGroup = { name: string; slug: string; items: CategoryItem[] };
export type Category      = { name: string; slug: string; groups: CategoryGroup[] };

export type Brand = { name: string; slug: string };

interface FiltersState {
  categories: Category[];
  brands: Brand[];
  loading: boolean;
  error: string | null;
  loaded: boolean;
  fetchFilters: () => Promise<void>;
}

export const useProductsStore = create<FiltersState>((set, get) => ({
  categories: [],
  brands: [],
  loading: false,
  error: null,
  loaded: false,

  fetchFilters: async () => {
    if (get().loaded) return;
    set({ loading: true, error: null });
    try {
      const [{ categories }, brands] = await Promise.all([
        fetchCatalog({ limit: 1 }),
        fetchBrands(),
      ]);
      set({ brands, categories, loading: false, loaded: true });
    } catch (e) {
      set({ error: (e as Error).message, loading: false, loaded: true, categories: [] });
    }
  },
}));
