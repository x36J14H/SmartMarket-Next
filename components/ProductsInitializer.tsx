'use client';

import { useEffect } from 'react';
import { useProductsStore } from '../store/productsStore';

// Загружает категории и бренды для фильтров при старте приложения
export function ProductsInitializer() {
  const fetchFilters = useProductsStore((s) => s.fetchFilters);
  useEffect(() => { fetchFilters(); }, [fetchFilters]);
  return null;
}
