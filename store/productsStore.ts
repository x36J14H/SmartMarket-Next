import { create } from 'zustand';
import { Product } from '../types';

// Структура товара из 1С
export interface ApiProduct {
  id: string;
  name: string;
  article: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string;       // ВидНоменклатуры.Родитель.Наименование
  subcategory: string;    // ВидНоменклатуры.Наименование
  type: string;           // тип внутри подкатегории
  brand: string;
  price: number;
  oldPrice?: number;
  imageUrl: string;
  images: string[];
  characteristics: Record<string, string>;
}

// Структура категории из 1С
export interface ApiCategory {
  name: string;
  slug: string;
  subcategories: {
    name: string;
    slug: string;
    types: { name: string; slug: string }[];
  }[];
}

// Типы для store — slug используется в URL, name — для фильтрации товаров
export type CategoryItem  = { name: string; slug: string };
export type CategoryGroup = { name: string; slug: string; items: CategoryItem[] };
export type Category      = { name: string; slug: string; groups: CategoryGroup[] };

const FALLBACK_IMAGE = '/service/image-unavailable.png';

function mapApiProduct(item: ApiProduct): Product {
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
    imageUrl: item.imageUrl || FALLBACK_IMAGE,
    images: item.images?.length ? item.images : [item.imageUrl || FALLBACK_IMAGE],
    characteristics: {
      ...(item.article ? { 'Артикул': item.article } : {}),
      ...(item.characteristics || {}),
    },
    sku: item.article || item.id,
  };
}

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
    const signal = AbortSignal.timeout(15000);
    try {
      const [catalogRes, categoriesRes] = await Promise.all([
        fetch('/api/1c/catalog', { signal }),
        fetch('/api/1c/categories', { signal }),
      ]);
      if (!catalogRes.ok) throw new Error(`Catalog API error: ${catalogRes.status}`);

      const products: Product[] = (await catalogRes.json()).items.map(mapApiProduct);
      const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))] as string[];

      let categories: Category[] = [];
      if (categoriesRes.ok) {
        const catData: { categories: ApiCategory[] } = await categoriesRes.json();
        categories = catData.categories
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

      set({ products, brands, categories, loading: false, loaded: true });
    } catch (e) {
      set({ error: (e as Error).message, loading: false, loaded: true, categories: [] });
    }
  },
}));
