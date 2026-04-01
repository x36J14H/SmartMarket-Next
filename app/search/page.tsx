'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Search as SearchIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductCard } from '../../components/ProductCard';
import { searchProductsWithAI, getCachedSearchResults } from '../../services/aiSearch';
import { Product } from '../../types';
import { useProductsStore } from '../../store/productsStore';

function SearchContent() {
  const products = useProductsStore((s) => s.products);
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState<Product[]>(() => getCachedSearchResults(query) || []);
  const [isLoading, setIsLoading] = useState(() => query.trim() !== '' && getCachedSearchResults(query) === null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) { setResults([]); setIsLoading(false); return; }
      const cached = getCachedSearchResults(query);
      if (cached) { setResults(cached); setIsLoading(false); return; }
      setResults([]);
      setIsLoading(true);
      try {
        const searchResults = await searchProductsWithAI(query, products);
        setResults(searchResults);
      } catch { setResults([]); }
      finally { setIsLoading(false); }
    };
    fetchResults();
  }, [query, products]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8 bg-zinc-50 min-h-screen">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200/60 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-3">
            Результаты поиска{query && <Sparkles className="text-emerald-500" size={28} />}
          </h1>
          {query && (
            <p className="mt-3 text-lg text-zinc-600 font-medium">
              По запросу «<span className="font-bold text-zinc-900">{query}</span>»
              {!isLoading && <span className="text-zinc-500"> найдено {results.length} {results.length === 1 ? 'товар' : results.length > 1 && results.length < 5 ? 'товара' : 'товаров'}</span>}
            </p>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-32 text-zinc-500">
            <Loader2 className="mb-6 h-16 w-16 animate-spin text-emerald-500" />
            <p className="text-xl font-bold text-zinc-900">ИИ ищет подходящие товары...</p>
            <p className="text-sm font-medium mt-2 text-zinc-500">Анализируем каталог и подбираем лучшее</p>
          </motion.div>
        ) : !query.trim() ? (
          <motion.div key="empty-query" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-white shadow-sm py-32 text-center">
            <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center mb-6 ring-1 ring-zinc-200/50">
              <SearchIcon className="h-10 w-10 text-zinc-400" />
            </div>
            <h2 className="mb-3 text-2xl font-extrabold text-zinc-900 tracking-tight">Введите запрос для поиска</h2>
            <p className="max-w-md text-zinc-500 text-lg font-medium">Используйте умную строку поиска в верхней части экрана.</p>
          </motion.div>
        ) : results.length === 0 ? (
          <motion.div key="no-results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-white shadow-sm py-32 text-center">
            <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center mb-6 ring-1 ring-zinc-200/50">
              <SearchIcon className="h-10 w-10 text-zinc-400" />
            </div>
            <h2 className="mb-3 text-2xl font-extrabold text-zinc-900 tracking-tight">Ничего не найдено</h2>
            <p className="max-w-md text-zinc-500 text-lg font-medium">Попробуйте изменить поисковый запрос.</p>
          </motion.div>
        ) : (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence>
              {results.map((product, index) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
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

// useSearchParams требует Suspense boundary согласно документации Next.js 15
export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
