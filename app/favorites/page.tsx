'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFavoritesStore } from '../../store/favoritesStore';
import { fetchProductById } from '../../lib/1c/catalog';
import { ProductCard } from '../../components/ProductCard';
import type { Product } from '../../types';

export default function FavoritesPage() {
  const favorites = useFavoritesStore((s) => s.favorites);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (favorites.length === 0) { setProducts([]); return; }

    setLoading(true);
    Promise.all(favorites.map((id) => fetchProductById(id)))
      .then((results) => setProducts(results.filter((p): p is Product => p !== null)))
      .finally(() => setLoading(false));
  }, [favorites.join(',')]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8 bg-zinc-50 min-h-screen">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">Избранное</h1>
          <p className="mt-3 text-lg font-medium text-zinc-500">
            {products.length} {products.length === 1 ? 'товар' : products.length > 1 && products.length < 5 ? 'товара' : 'товаров'}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center py-32">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          </motion.div>
        ) : favorites.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-white py-32 text-center shadow-sm ring-1 ring-zinc-200/50">
            <div className="rounded-full bg-zinc-100 p-8 mb-6 shadow-sm ring-1 ring-zinc-200/50">
              <Heart className="h-16 w-16 text-zinc-400" />
            </div>
            <h2 className="mb-3 text-3xl font-extrabold text-zinc-900 tracking-tight">В избранном пока пусто</h2>
            <p className="mb-10 max-w-md text-lg font-medium text-zinc-500">Добавляйте товары в избранное, чтобы не потерять их и вернуться к покупкам позже.</p>
            <Link href="/catalog" className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-8 py-4 text-base font-bold text-white shadow-md transition-all hover:bg-emerald-500 hover:-translate-y-0.5">
              <ArrowLeft className="mr-2 h-5 w-5" />Перейти в каталог
            </Link>
          </motion.div>
        ) : (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence>
              {products.map((product, index) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
