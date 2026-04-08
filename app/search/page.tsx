'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, Search as SearchIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductCard } from '../../components/ProductCard';
import { searchProducts } from '../../services/aiSearch';
import type { Product } from '../../types';

const PAGE_SIZE = 20;

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const page = Number(searchParams.get('page') ?? '1');

  const [results, setResults] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setTotal(0); return; }

    const controller = new AbortController();
    setIsLoading(true);

    searchProducts(query, page, PAGE_SIZE, controller.signal)
      .then(({ products, total: t }) => { setResults(products); setTotal(t); })
      .catch(() => {})
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [query, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`/search?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8 bg-zinc-50 min-h-screen">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200/60 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">Результаты поиска</h1>
          {query && (
            <p className="mt-3 text-lg text-zinc-600 font-medium">
              По запросу «<span className="font-bold text-zinc-900">{query}</span>»
              {!isLoading && (
                <span className="text-zinc-500"> — найдено {total} {total === 1 ? 'товар' : total > 1 && total < 5 ? 'товара' : 'товаров'}</span>
              )}
            </p>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-32 text-zinc-500">
            <Loader2 className="mb-6 h-16 w-16 animate-spin text-emerald-500" />
            <p className="text-xl font-bold text-zinc-900">Ищем товары...</p>
          </motion.div>
        ) : !query.trim() ? (
          <motion.div key="empty-query" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-white shadow-sm py-32 text-center">
            <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center mb-6 ring-1 ring-zinc-200/50">
              <SearchIcon className="h-10 w-10 text-zinc-400" />
            </div>
            <h2 className="mb-3 text-2xl font-extrabold text-zinc-900 tracking-tight">Введите запрос для поиска</h2>
            <p className="max-w-md text-zinc-500 text-lg font-medium">Используйте строку поиска в верхней части экрана.</p>
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
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence>
                {results.map((product, index) => (
                  <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button onClick={() => goToPage(page - 1)} disabled={page <= 1} className="p-2 rounded-xl bg-white shadow-sm ring-1 ring-zinc-200/50 text-zinc-500 hover:text-zinc-900 disabled:opacity-30 transition-colors">
                  <ChevronLeft size={20} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .reduce<(number | '...')[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-zinc-400">…</span>
                    ) : (
                      <button key={p} onClick={() => goToPage(p as number)} className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${page === p ? 'bg-emerald-500 text-white shadow-md' : 'bg-white text-zinc-700 shadow-sm ring-1 ring-zinc-200/50 hover:bg-zinc-50'}`}>
                        {p}
                      </button>
                    )
                  )}
                <button onClick={() => goToPage(page + 1)} disabled={page >= totalPages} className="p-2 rounded-xl bg-white shadow-sm ring-1 ring-zinc-200/50 text-zinc-500 hover:text-zinc-900 disabled:opacity-30 transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
