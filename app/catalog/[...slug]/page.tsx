'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Filter, X, LayoutGrid, List, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '../../../components/ProductCard';
import { useProductsStore } from '../../../store/productsStore';
import { fetchCatalog } from '../../../lib/1c/catalog';
import type { Category } from '../../../store/productsStore';
import type { Product } from '../../../types';

const PAGE_SIZE = 20;

function nameBySlug(categories: Category[], catSlug: string, subSlug?: string, typeSlug?: string): string {
  // Ищем по первому уровню (категория)
  const cat = categories.find((c) => c.slug === catSlug);
  if (!cat) {
    // Слаг не найден на уровне категорий — ищем по всем уровням иерархии
    for (const c of categories) {
      const grp = c.groups.find((g) => g.slug === catSlug);
      if (grp) return grp.name;
      for (const g of c.groups) {
        const item = g.items.find((i) => i.slug === catSlug);
        if (item) return item.name;
      }
    }
    return catSlug;
  }
  if (!subSlug) return cat.name;
  const grp = cat.groups.find((g) => g.slug === subSlug);
  if (!grp) {
    // Ищем subSlug по всем группам всех категорий
    for (const c of categories) {
      for (const g of c.groups) {
        if (g.slug === subSlug) return g.name;
        const item = g.items.find((i) => i.slug === subSlug);
        if (item) return item.name;
      }
    }
    return subSlug;
  }
  if (!typeSlug) return grp.name;
  return grp.items.find((i) => i.slug === typeSlug)?.name ?? typeSlug;
}

function CatalogContent() {
  const { categories, brands, loaded, fetchFilters } = useProductsStore();
  const params = useParams<{ slug: string[] }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const slug = params.slug ?? [];
  const [categoryParam, subcategoryParam, typeParam] = slug;

  const brandRaw = searchParams.get('brand');
  const brandParams: string[] = brandRaw ? brandRaw.split(',').filter(Boolean) : [];
  const pageParam = Number(searchParams.get('page') ?? '1');

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeCategory, setActiveCategory] = useState(categories[0]?.name || '');
  const [mobileStep, setMobileStep] = useState<'categories' | 'subcategories'>('categories');

  // Гарантируем загрузку категорий при прямом переходе по URL
  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  // Название страницы — берём из первого товара, чтобы не зависеть от store
  const [resolvedTitle, setResolvedTitle] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryParam) return;
    const controller = new AbortController();
    setIsLoading(true);

    fetchCatalog(
      {
        category: typeParam ?? subcategoryParam ?? categoryParam,
        brand: brandParams.length ? brandParams : undefined,
        page: pageParam,
        limit: PAGE_SIZE,
      },
      controller.signal
    )
      .then(({ products: p, total: t }) => {
        setProducts(p);
        setTotal(t);
        // Резолвим название из первого товара по слагу
        if (p.length > 0 && !resolvedTitle) {
          const first = p[0];
          if (typeParam && first.typeSlug === typeParam) {
            setResolvedTitle(first.type);
          } else if (subcategoryParam && first.subcategorySlug === subcategoryParam) {
            setResolvedTitle(first.subcategory);
          } else if (categoryParam && first.categorySlug === categoryParam) {
            setResolvedTitle(first.category);
          } else {
            // Слаг может быть любого уровня — ищем совпадение
            if (first.typeSlug === categoryParam) setResolvedTitle(first.type);
            else if (first.subcategorySlug === categoryParam) setResolvedTitle(first.subcategory);
            else if (first.categorySlug === categoryParam) setResolvedTitle(first.category);
          }
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [categoryParam, subcategoryParam, typeParam, brandRaw, pageParam]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const buildUrl = (cat: string, sub?: string, type?: string, brands?: string[], page?: number) => {
    const parts = ['/catalog', cat, sub, type].filter(Boolean).join('/');
    const qs = new URLSearchParams();
    if (brands?.length) qs.set('brand', brands.join(','));
    if (page && page > 1) qs.set('page', String(page));
    return qs.toString() ? `${parts}?${qs.toString()}` : parts;
  };

  const handleBrandChange = (brand: string) => {
    const next = brandParams.includes(brand)
      ? brandParams.filter((b) => b !== brand)
      : [...brandParams, brand];
    router.push(buildUrl(categoryParam, subcategoryParam, typeParam, next));
  };

  const goToPage = (page: number) => {
    router.push(buildUrl(categoryParam, subcategoryParam, typeParam, brandParams, page));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Главная каталога — дерево категорий
  if (!categoryParam) {
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
            <div>
              <button
                onClick={() => router.push(`/catalog/${activeCategoryObj.slug}`)}
                className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 mb-8 sm:mb-10 hover:text-emerald-600 transition-colors text-left"
              >
                {activeCategoryObj?.name}
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 sm:gap-x-12 gap-y-8 sm:gap-y-12">
                {activeCategoryObj?.groups?.map((group) => (
                  <div key={group.name} className="space-y-4 sm:space-y-5">
                    <button
                      onClick={() => router.push(`/catalog/${activeCategoryObj.slug}/${group.slug}`)}
                      className="font-bold text-zinc-900 text-base sm:text-lg border-b border-zinc-100 pb-2 w-full text-left hover:text-emerald-600 transition-colors"
                    >
                      {group.name}
                    </button>
                    <ul className="space-y-2 sm:space-y-3">
                      {group.items.map((item) => (
                        <li key={item.slug}>
                          <button
                            onClick={() => router.push(`/catalog/${activeCategoryObj.slug}/${group.slug}/${item.slug}`)}
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
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Пока категории не загружены — показываем скелетон вместо слага
  const pageTitle = resolvedTitle
    ?? (loaded ? nameBySlug(categories, categoryParam, subcategoryParam, typeParam) : null);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 bg-[#fbfbfd] min-h-screen">
      {/* Breadcrumbs */}
      <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-zinc-400">
        <Link href="/" className="hover:text-zinc-900 transition-colors">Главная</Link>
        <span>/</span>
        <Link href="/catalog" className="hover:text-zinc-900 transition-colors">Каталог</Link>
        {categoryParam && (
          <>
            <span>/</span>
            <span className="text-zinc-900 font-bold">{pageTitle || categoryParam}</span>
          </>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200/70 pb-6 gap-4">
        <div>
          {pageTitle ? (
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 font-display">
              {pageTitle}
            </h1>
          ) : (
            <div className="h-10 w-64 rounded-2xl bg-zinc-200 animate-pulse" />
          )}
          <p className="text-xs sm:text-sm font-medium text-zinc-500 mt-1">
            {total > 0 ? `Найдено ${total} товаров со склада` : 'Прямой каталог SmartMarket'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="hidden sm:flex items-center bg-zinc-100 p-1 rounded-2xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-zinc-950 shadow-2xs'
                  : 'text-zinc-400 hover:text-zinc-700'
              }`}
              title="Сетка"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-zinc-950 shadow-2xs'
                  : 'text-zinc-400 hover:text-zinc-700'
              }`}
              title="Список"
            >
              <List size={16} />
            </button>
          </div>

          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-zinc-800 hover:bg-zinc-50 border border-zinc-200/80 shadow-2xs lg:hidden transition-colors"
          >
            <Filter size={16} />
            <span>Фильтры</span>
            {brandParams.length > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                {brandParams.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active Brand Badges */}
      {brandParams.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-zinc-400">Выбрано:</span>
          {brandParams.map((b) => (
            <button
              key={b}
              onClick={() => handleBrandChange(b)}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 ring-1 ring-inset ring-emerald-600/20 hover:bg-emerald-100 transition-colors"
            >
              <span>{brands.find((br) => br.slug === b)?.name || b}</span>
              <X size={12} />
            </button>
          ))}
          <button
            onClick={() => router.push(buildUrl(categoryParam, subcategoryParam, typeParam))}
            className="text-xs font-semibold text-zinc-400 hover:text-rose-500 transition-colors underline ml-2"
          >
            Сбросить все
          </button>
        </div>
      )}

      <div className="mt-8 lg:grid lg:grid-cols-4 lg:gap-x-10">
        <aside className={`fixed inset-0 z-50 lg:relative lg:z-0 lg:block ${isFiltersOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm lg:hidden" onClick={() => setIsFiltersOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white p-6 shadow-2xl lg:static lg:w-auto lg:bg-white lg:p-7 lg:rounded-3xl lg:shadow-sm lg:border lg:border-zinc-200/80 space-y-8 lg:sticky lg:top-24 overflow-y-auto max-h-[85vh]">
            <div className="flex items-center justify-between lg:hidden mb-4">
              <h2 className="text-xl font-bold text-zinc-950 font-display">Фильтры</h2>
              <button onClick={() => setIsFiltersOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-900"><X size={22} /></button>
            </div>

            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Категории</h3>
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => router.push('/catalog')}
                  className={`block text-xs sm:text-sm font-semibold transition-colors ${
                    !categoryParam ? 'text-emerald-600 font-bold' : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  Все категории
                </button>
                {categories.map((cat) => (
                  <div key={cat.slug} className="space-y-1">
                    <button
                      onClick={() => router.push(`/catalog/${cat.slug}`)}
                      className={`block text-xs sm:text-sm font-semibold transition-colors text-left ${
                        categoryParam === cat.slug && !subcategoryParam ? 'text-emerald-600 font-bold' : 'text-zinc-600 hover:text-zinc-950'
                      }`}
                    >
                      {cat.name}
                    </button>
                    {categoryParam === cat.slug && cat.groups.map((group) => (
                      <div key={group.slug} className="ml-3 space-y-1 border-l border-zinc-100 pl-3 pt-1">
                        <button
                          onClick={() => router.push(`/catalog/${cat.slug}/${group.slug}`)}
                          className={`block text-xs transition-colors text-left ${
                            subcategoryParam === group.slug ? 'text-emerald-600 font-bold' : 'text-zinc-500 hover:text-zinc-800'
                          }`}
                        >
                          {group.name}
                        </button>
                        {subcategoryParam === group.slug && group.items.map((item) => (
                          <button
                            key={item.slug}
                            onClick={() => router.push(`/catalog/${cat.slug}/${group.slug}/${item.slug}`)}
                            className={`block text-[11px] ml-2 transition-colors text-left ${
                              typeParam === item.slug ? 'text-emerald-600 font-bold' : 'text-zinc-400 hover:text-zinc-700'
                            }`}
                          >
                            — {item.name}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-6">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Бренды</h3>
              <div className="mt-4 space-y-2.5 max-h-56 overflow-y-auto scrollbar-hide pr-1">
                {brands.map((brand) => (
                  <div key={brand.slug} className="flex items-center group">
                    <input
                      id={`brand-${brand.slug}`}
                      type="checkbox"
                      checked={brandParams.includes(brand.slug)}
                      onChange={() => handleBrandChange(brand.slug)}
                      className="h-4 w-4 rounded-md border-zinc-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <label
                      htmlFor={`brand-${brand.slug}`}
                      className="ml-2.5 text-xs sm:text-sm font-medium text-zinc-600 group-hover:text-zinc-950 cursor-pointer transition-colors"
                    >
                      {brand.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="mt-8 lg:col-span-3 lg:mt-0">
          {isLoading ? (
            /* Shimmer Skeleton Cards */
            <div className={`grid gap-4 sm:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-sm animate-pulse flex flex-col gap-3">
                  <div className="aspect-[4/5] rounded-2xl bg-zinc-100 w-full" />
                  <div className="h-3 w-20 rounded bg-zinc-100 mt-2" />
                  <div className="h-4 w-3/4 rounded bg-zinc-100" />
                  <div className="h-6 w-24 rounded bg-zinc-100 mt-auto" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col h-72 items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-white p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-zinc-200/50">
                <Filter size={24} className="text-zinc-400" />
              </div>
              <p className="text-zinc-950 font-extrabold text-xl font-display">Товары не найдены</p>
              <p className="text-zinc-500 font-normal text-sm mt-1 max-w-sm">
                Попробуйте скорректировать фильтры или перейти в соседнюю категорию
              </p>
              <button
                onClick={() => router.push('/catalog')}
                className="mt-6 px-6 py-2.5 bg-zinc-950 text-white rounded-2xl font-bold text-xs hover:bg-zinc-800 transition-all shadow-sm"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <>
              <div className={`grid gap-3.5 sm:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} viewMode={viewMode} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button onClick={() => goToPage(pageParam - 1)} disabled={pageParam <= 1} className="p-2.5 rounded-2xl bg-white shadow-2xs border border-zinc-200/80 text-zinc-500 hover:text-zinc-950 disabled:opacity-30 transition-colors">
                    <ChevronLeft size={18} />
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
                        <button key={p} onClick={() => goToPage(p as number)} className={`w-10 h-10 rounded-2xl text-xs font-bold transition-all ${pageParam === p ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-white text-zinc-700 border border-zinc-200/80 hover:bg-zinc-50'}`}>
                          {p}
                        </button>
                      )
                    )}
                  <button onClick={() => goToPage(pageParam + 1)} disabled={pageParam >= totalPages} className="p-2.5 rounded-2xl bg-white shadow-2xs border border-zinc-200/80 text-zinc-500 hover:text-zinc-950 disabled:opacity-30 transition-colors">
                    <ChevronRight size={18} />
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
