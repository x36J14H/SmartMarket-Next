'use client';

import Link from 'next/link';
import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { useProductsStore } from '../store/productsStore';
import { fetchCatalog } from '../lib/1c/catalog';
import type { Product } from '../types';

export default function HomePage() {
  const { categories } = useProductsStore();
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCatalog({ page: 1, limit: 8 })
      .then(({ products }) => setPopularProducts(products))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-24 pb-24">
      <section className="relative overflow-hidden bg-zinc-950 py-24 sm:py-32 lg:pb-40">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 left-1/2 -z-10 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[120px]" />
          <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-indigo-500/20 blur-[120px]" />
          <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] rounded-full bg-rose-500/10 blur-[100px]" />
        </div>
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-medium text-emerald-300 ring-1 ring-inset ring-white/10 mb-8 backdrop-blur-md">
              <Sparkles className="h-4 w-4" />
              <span>Умный поиск с AI уже доступен</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl lg:text-8xl">
              Покупки будущего <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">уже сегодня</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mt-8 text-lg text-zinc-400 sm:text-xl leading-relaxed max-w-2xl mx-auto font-medium">
              Быстрый запуск, удобное управление и полная независимость. Начните продавать напрямую своим клиентам без комиссий маркетплейсов.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/catalog" className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-4 text-base font-bold text-zinc-950 transition-all hover:bg-emerald-400 hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]">
                Перейти в каталог<ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">Популярные товары</h2>
            <p className="mt-3 text-lg font-medium text-zinc-500">Выбор наших покупателей на этой неделе</p>
          </div>
          <Link href="/catalog" className="hidden sm:flex items-center text-sm font-bold text-emerald-600 hover:text-emerald-500 transition-colors">
            Смотреть все <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        {loading && <p className="text-zinc-400 text-sm font-medium">Загрузка товаров...</p>}
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {popularProducts.map((product, index) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.5, delay: index * 0.1 }}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
        <div className="mt-10 sm:hidden">
          <Link href="/catalog" className="flex w-full items-center justify-center rounded-2xl bg-zinc-100 px-4 py-4 text-base font-bold text-zinc-900 hover:bg-zinc-200 transition-colors">
            Смотреть все товары
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">Категории</h2>
          <p className="mt-3 text-lg font-medium text-zinc-500">Найдите то, что нужно именно вам</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4 auto-rows-[250px]">
          {categories.map((category, index) => {
            const isLarge = index === 0 || index === 3;
            return (
              <motion.div key={category.name} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.5, delay: index * 0.1 }} className={isLarge ? 'md:col-span-2' : 'md:col-span-1'}>
                <Link href={`/catalog/${category.slug}`} className="group relative flex h-full flex-col items-start justify-between overflow-hidden rounded-3xl bg-zinc-100 p-8 transition-all hover:bg-emerald-50 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 border border-zinc-200/50">
                  <div className="rounded-2xl bg-white p-4 shadow-sm transition-transform duration-500 group-hover:scale-110 ring-1 ring-zinc-200/50">
                    <ShoppingBag className="h-8 w-8 text-zinc-700 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <div className="mt-auto relative z-10">
                    <h3 className="text-2xl font-extrabold text-zinc-900 tracking-tight">{category.name}</h3>
                    <p className="mt-2 text-sm font-bold text-zinc-500">{category.groups.flatMap((g) => g.items).length} подкатегорий</p>
                  </div>
                  <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-emerald-500/5 blur-3xl transition-all duration-500 group-hover:bg-emerald-500/20 group-hover:scale-150" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
