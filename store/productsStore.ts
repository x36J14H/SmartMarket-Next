import { create } from 'zustand';
import { Product } from '../types';

export interface ApiProduct {
  id: string;
  name: string;
  type: string;
  article: string;
  description: string;
}

const FALLBACK_IMAGE = '/service/image-unavailable.png';

export const CATEGORIES = [
  {
    name: 'Электроника',
    groups: [
      { name: 'Компьютеры и периферия', items: ['Ноутбуки', 'Мониторы', 'Системные блоки', 'Периферия'] },
      { name: 'Телефоны', items: ['Смартфоны', 'Аксессуары'] },
    ],
  },
  {
    name: 'Одежда',
    groups: [
      { name: 'Мужская одежда', items: ['Футболки', 'Брюки', 'Куртки'] },
      { name: 'Женская одежда', items: ['Платья', 'Блузки', 'Джинсы'] },
    ],
  },
  {
    name: 'Дом и сад',
    groups: [
      { name: 'Мебель', items: ['Диваны', 'Столы', 'Стулья'] },
      { name: 'Кухня', items: ['Посуда', 'Хранение'] },
    ],
  },
];

function mapApiProduct(item: ApiProduct): Product {
  return {
    id: item.id,
    slug: item.article || item.id,
    name: item.name,
    category: 'Электроника',
    subcategory: 'Ноутбуки',
    brand: 'Неизвестно',
    price: 0,
    description: item.description || 'Описание не указано',
    shortDescription: item.description || 'Описание не указано',
    imageUrl: FALLBACK_IMAGE,
    images: [FALLBACK_IMAGE],
    characteristics: {
      'Артикул': item.article || '—',
      'Тип': item.type || '—',
    },
    sku: item.article || item.id,
  };
}

interface ProductsState {
  products: Product[];
  categories: typeof CATEGORIES;
  brands: string[];
  loading: boolean;
  error: string | null;
  loaded: boolean;
  fetchProducts: () => Promise<void>;
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  categories: CATEGORIES,
  brands: [],
  loading: false,
  error: null,
  loaded: false,

  fetchProducts: async () => {
    if (get().loaded) return;
    set({ loading: true, error: null });
    try {
      const res = await fetch('/1c-api/catalog');
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      const products = data.items.map(mapApiProduct);
      const brands = [...new Set(products.map((p: Product) => p.brand))];
      set({ products, brands, loading: false, loaded: true });
    } catch (e) {
      set({ error: (e as Error).message, loading: false, loaded: true });
    }
  },
}));
