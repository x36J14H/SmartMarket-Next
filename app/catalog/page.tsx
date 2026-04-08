'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X, LayoutGrid, List, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductCard } from '../../components/ProductCard';
import { useProductsStore } from '../../store/productsStore';
import { fetchCatalog } from '../../lib/1c/catalog';
import type { Category } from '../../store/productsStore';
import type { Product } from '../../types';

const PAGE_SIZE = 20;

function categoryNameBySlug(categories: Category[], slug: string) {
  return categories.find((c) => c.slug === slug)?.name ?? slug;
}
function subcategoryNameBySlug(categories: Category[], catSlug: string, subSlug: string) {
  const cat = categories.find((c) => c.slug === catSlug);
  return cat?.groups.find((g) => g.slug === subSlug)?.name ?? subSlug;
}
function typeNameBySlug(categories: Category[], catSlug: string, subSlug: string, typeSlug: string) {
  const cat = categories.find((c) => c.slug === catSlug);
  const grp = cat?.groups.find((g) => g.slug === subSlug);
  return grp?.items.find((i) => i.slug === typeSlug)?.name ?? typeSlug;
}

function CatalogContent() {
  const { categories, brands } = useProductsStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeCategory, setActiveCategory] = useState(categories[0]?.name || '');
  const [mobileStep, setMobileStep] = useState<'categories' | 'subcategories'>('categories');

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const categoryParam = searchParams.get('category') ?? undefined;
  const subcategoryParam = searchParams.get('subcategory') ?? undefined;
  const typeParam = searchParams.get('type') ?? undefined;
  const brandParam = searchParams.get('brand') ?? undefined;
  const pageParam = Number(searchParams.get('page') ?? '1');

  // Для поиска по каталогу используем slug категории напрямую
  // API принимает categorySlug, brandSlug, q
  useEffect(() => {
    if (!categoryParam && !subcategoryParam) return;

    const controller = new AbortController();
    setIsLoading(true);

    fetchCatalog(
      {
        category: typeParam ?? subcategoryParam ?? categoryParam,
        brand: brandParam,
        page: pageParam,
        limit: PAGE_SIZE,
      },
      controller.signal
    )
      .then(({ products: p, total: t }) => {
        setProducts(p);
        setTotal(t);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [categoryParam, subcategoryParam, typeParam, brandParam, pageParam]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const setSearchParams = (newParams: URLSearchParams) => {
    router.push(`/catalog?${newParams.toString()}`);
  };

  const handleBrandChange = (brand: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('page');
    if (brandParam === brand) newParams.delete('brand');
    else newParams.set('brand', brand);
    setSearchParams(newParams);
  };

  const goToPage = (page: number) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('page', String(page));
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Показываем дерево категорий если нет активного фильтра
  if (!categoryParam && !subcategoryParam) {
    const activeCategoryObj = categories.find((c) => c.name === activeCategory) || categories[0];

    if (categories.length === 0) {
      return (
        <div className="mx-auto max-w-[1400px] px-4 py-8 sm:py-12 sm:px-6 lg:px-8 bg-zinc-50 min-h-[80vh] flex items-center justify-center">
          <div className="text-center">
            <p className="text-zinc-500 font-medium text-lg">Каталог недоступен</p>
            <p className="text-zinc-400 text-sm mt-2">Не удалось загрузить данные с сервера</p>
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:py-12 sm:px-6 lg:px-8 bg-zinc-50 min-h-[80vh]">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          <div className={`w-full md:w-72 shrink-0 flex flex-col gap-2 ${mobileStep === 'subcategories' ? 'hidden md:flex' : 'flex'}`}>
            <h2 className="text-2xl font-extrabold text-zinc-900 mb-6 px-4 tracking-tight">Каталог</h2>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button key={cat.name} onMouseEnter={() => setActiveCategory(cat.name)} onClick={() => { setActiveCategory(cat.name); setMobileStep('subcategories'); }} className={`w-full text-left px-5 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center justify-between group ${activeCategory === cat.name ? 'bg-white text-emerald-600 shadow-md shadow-zinc-200/50 ring-1 ring-zinc-200/50 md:translate-x-2' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'}`}>
                  {cat.name}
                  <ArrowRight size={16} className={`md:hidden transition-transform ${activeCategory === cat.name ? 'text-emerald-500' : 'text-zinc-300'}`} />
                </button>
              ))}
            </div>
          </div>

          <div className={`flex-1 rounded-3xl bg-white p-6 sm:p-10 shadow-sm ring-1 ring-zinc-200/50 ${mobileStep === 'categories' ? 'hidden md:block' : 'block'}`}>
            <button onClick={() => setMobileStep('categories')} className="md:hidden flex items-center gap-2 text-zinc-500 font-bold text-sm mb-6 hover:text-zinc-900 transition-colors">
              <ArrowLeft size={18} />Назад к категориям
            </button>
            <motion.div key={activeCategoryObj?.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <button
                onClick={() => { const p = new URLSearchParams(); p.set('category', activeCategoryObj.slug); router.push(`/catalog?${p.toString()}`); }}
                className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 mb-8 sm:mb-10 hover:text-emerald-600 transition-colors text-left"
              >
                {activeCategoryObj?.name}
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 sm:gap-x-12 gap-y-8 sm:gap-y-12">
                {activeCategoryObj?.groups?.map((group) => (
                  <div key={group.name} className="space-y-4 sm:space-y-5">
                    <button
                      onClick={() => { const p = new URLSearchParams(); p.set('category', activeCategoryObj.slug); p.set('subcategory', group.slug); router.push(`/catalog?${p.toString()}`); }}
                      className="font-bold text-zinc-900 text-base sm:text-lg border-b border-zinc-100 pb-2 w-full text-left hover:text-emerald-600 transition-colors"
                    >
                      {group.name}
                    </button>
                    <ul className="space-y-2 sm:space-y-3">
                      {group.items.map((item) => (
                        <li key={item.slug}>
                          <button
                            onClick={() => { const p = new URLSearchParams(); p.set('category', activeCategoryObj.slug); p.set('subcategory', group.slug); p.set('type', item.slug); router.push(`/catalog?${p.toString()}`); }}
                            className="text-sm font-medium text-zinc-500 hover:text-emerald-600 text-left transition-colors flex items-center group"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 mr-2 group-hover:bg-emerald-500 transition-colors"></span>
                            {item.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  const pageTitle = typeParam
    ? typeNameBySlug(categories, categoryParam!, subcategoryParam!, typeParam)
    : subcategoryParam
    ? subcategoryNameBySlug(categories, categoryParam!, subcategoryParam)
    : categoryParam
    ? categoryNameBySlug(categories, categoryParam)
    : 'Каталог товаров';

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8 bg-zinc-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200/60 pb-6 gap-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">{pageTitle}</h1>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center bg-white rounded-xl p-1 shadow-sm ring-1 ring-zinc-200/50">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}><LayoutGrid size={18} /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}><List size={18} /></button>
          </div>
          <button onClick={() => setIsFiltersOpen(!isFiltersOpen)} className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 shadow-sm ring-1 ring-zinc-200/50 lg:hidden transition-colors">
            <Filter size={18} />Фильтры
          </button>
        </div>
      </div>

      <div className="mt-8 lg:grid lg:grid-cols-4 lg:gap-x-10">
        <aside className={`fixed inset-0 z-50 lg:relative lg:z-0 lg:block ${isFiltersOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm lg:hidden" onClick={() => setIsFiltersOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white p-6 shadow-2xl lg:static lg:w-auto lg:bg-white lg:p-6 lg:rounded-3xl lg:shadow-sm lg:ring-1 lg:ring-zinc-200/50 space-y-10 lg:sticky lg:top-24 overflow-y-auto">
            <div className="flex items-center justify-between lg:hidden mb-6">
              <h2 className="text-xl font-bold text-zinc-900">Фильтры</h2>
              <button onClick={() => setIsFiltersOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-900"><X size={24} /></button>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">Категории</h3>
              <div className="mt-5 space-y-3">
                <button onClick={() => router.push('/catalog')} className={`block text-sm font-medium transition-colors ${!categoryParam ? 'text-emerald-600 font-bold' : 'text-zinc-500 hover:text-zinc-900'}`}>Все категории</button>
                {categories.map((cat) => (
                  <div key={cat.slug}>
                    <button onClick={() => { const p = new URLSearchParams(); p.set('category', cat.slug); setSearchParams(p); }} className={`block text-sm font-medium transition-colors ${categoryParam === cat.slug && !subcategoryParam ? 'text-emerald-600 font-bold' : 'text-zinc-500 hover:text-zinc-900'}`}>{cat.name}</button>
                    {categoryParam === cat.slug && cat.groups.map((group) => (
                      <div key={group.slug} className="ml-3 mt-2 space-y-1.5">
                        <button onClick={() => { const p = new URLSearchParams(); p.set('category', cat.slug); p.set('subcategory', group.slug); setSearchParams(p); }} className={`block text-sm transition-colors ${subcategoryParam === group.slug ? 'text-emerald-600 font-semibold' : 'text-zinc-400 hover:text-zinc-700'}`}>{group.name}</button>
                        {subcategoryParam === group.slug && group.items.map((item) => (
                          <button key={item.slug} onClick={() => { const p = new URLSearchParams(); p.set('category', cat.slug); p.set('subcategory', group.slug); p.set('type', item.slug); setSearchParams(p); }} className={`block text-xs ml-2 transition-colors ${typeParam === item.slug ? 'text-emerald-600 font-semibold' : 'text-zinc-400 hover:text-zinc-600'}`}>— {item.name}</button>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">Бренды</h3>
              <div className="mt-5 space-y-3">
                {brands.map((brand) => (
                  <div key={brand.slug} className="flex items-center group">
                    <input id={`brand-${brand.slug}`} type="checkbox" checked={brandParam === brand.slug} onChange={() => handleBrandChange(brand.slug)} className="h-5 w-5 rounded-md border-zinc-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
                    <label htmlFor={`brand-${brand.slug}`} className="ml-3 text-sm font-medium text-zinc-600 group-hover:text-zinc-900 cursor-pointer transition-colors">{brand.name}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="mt-8 lg:col-span-3 lg:mt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-32">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col h-64 items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-white shadow-sm">
              <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4"><Filter size={24} className="text-zinc-400" /></div>
              <p className="text-zinc-900 font-bold text-lg">Товары не найдены</p>
              <p className="text-zinc-500 font-medium text-sm mt-1">Попробуйте изменить параметры фильтрации</p>
              <button onClick={() => router.push('/catalog')} className="mt-6 px-6 py-2 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-colors">Сбросить фильтры</button>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-zinc-500 font-medium">
                Найдено: {total} товаров
              </div>
              <motion.div layout className={`grid gap-4 sm:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                <AnimatePresence>
                  {products.map((product) => (
                    <motion.div key={product.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}>
                      <ProductCard product={product} viewMode={viewMode} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button onClick={() => goToPage(pageParam - 1)} disabled={pageParam <= 1} className="p-2 rounded-xl bg-white shadow-sm ring-1 ring-zinc-200/50 text-zinc-500 hover:text-zinc-900 disabled:opacity-30 transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - pageParam) <= 2)
                    .reduce<(number | '...')[]>((acc, p, i, arr) => {
                      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === '...' ? (
                        <span key={`ellipsis-${i}`} className="px-2 text-zinc-400">…</span>
                      ) : (
                        <button key={p} onClick={() => goToPage(p as number)} className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${pageParam === p ? 'bg-emerald-500 text-white shadow-md' : 'bg-white text-zinc-700 shadow-sm ring-1 ring-zinc-200/50 hover:bg-zinc-50'}`}>
                          {p}
                        </button>
                      )
                    )}
                  <button onClick={() => goToPage(pageParam + 1)} disabled={pageParam >= totalPages} className="p-2 rounded-xl bg-white shadow-sm ring-1 ring-zinc-200/50 text-zinc-500 hover:text-zinc-900 disabled:opacity-30 transition-colors">
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" /></div>}>
      <CatalogContent />
    </Suspense>
  );
}
