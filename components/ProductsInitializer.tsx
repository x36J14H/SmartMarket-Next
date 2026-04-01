'use client';

import { useEffect } from 'react';
import { useProductsStore } from '../store/productsStore';

// Инициализирует загрузку товаров при старте приложения
export function ProductsInitializer() {
  const fetchProducts = useProductsStore((s) => s.fetchProducts);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  return null;
}
