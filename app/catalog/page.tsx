'use client';

import { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X, LayoutGrid, List, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductCard } from '../../components/ProductCard';
import { useProductsStore } from '../../store/productsStore';
import type { Category } from '../../store/productsStore';

// Хелперы: slug → name для фильтрации товаров
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
  const { products, categories, brands } = useProductsStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeCategory, setActiveCategory] = useState(categories[0]?.name || '');
  const [mobileStep, setMobileStep] = useState<'categories' | 'subcategories'>('categories');

  const categoryParam = searchParams.get('category');
  const subcategoryParam = searchParams.get('subcategory');
  const typeParam = searchParams.get('type');
  const brandParam = searchParams.getAll('brand');
  const minPriceParam = searchParams.get('minPrice');
  const maxPriceParam = searchParams.get('maxPrice');

  const charParams = useMemo(() => {
    const params: Record<string, string[]> = {};
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith('char_')) {
        const charName = key.replace('char_', '');
        if (!params[charName]) params[charName] = [];
        params[charName].push(value);
      }
    }
    return params;
  }, [searchParams]);

  const setSearchParams = (newParams: URLSearchParams) => {
    router.push(`/catalog?${newParams.toString()}`);
  };

  const availableCharacteristics = useMemo(() => {
    if (!categoryParam) return {};
    const catName = categoryNameBySlug(categories, categoryParam);
    const chars: Record<string, Set<string>> = {};
    products.filter((p) => p.category === catName).forEach((p) => {
      Object.entries(p.characteristics).forEach(([key, value]) => {
        if (key === 'Бренд') return;
        if (!chars[key]) chars[key] = new Set();
        chars[key].add(value);
      });
    });
    const result: Record<string, string[]> = {};
    Object.entries(chars).forEach(([key, values]) => {
      if (values.size > 1) result[key] = Array.from(values).sort();
    });
    return result;
  }, [categoryParam, products]);

  const handleBrandChange = (brand: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    const currentBrands = newParams.getAll('brand');
    newParams.delete('brand');
    if (currentBrands.includes(brand)) {
      currentBrands.filter((b) => b !== brand).forEach((b) => newParams.append('brand', b));
    } else {
      [...currentBrands, brand].forEach((b) => newParams.append('brand', b));
    }
    setSearchParams(newParams);
  };

  const handleCharChange = (charName: string, value: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    const paramKey = `char_${charName}`;
    const currentValues = newParams.getAll(paramKey);
    newParams.delete(paramKey);
    if (currentValues.includes(value)) {
      currentValues.filter((v) => v !== value).forEach((v) => newParams.append(paramKey, v));
    } else {
      [...currentValues, value].forEach((v) => newParams.append(paramKey, v));
    }
    setSearchParams(newParams);
  };

  const filteredProducts = useMemo(() => {
    // Конвертируем slugи в names для сравнения с полями товаров
    const catName = categoryParam ? categoryNameBySlug(categories, categoryParam) : null;
    const subName = subcategoryParam ? subcategoryNameBySlug(categories, categoryParam!, subcategoryParam) : null;
    const typeName = typeParam ? typeNameBySlug(categories, categoryParam!, subcategoryParam!, typeParam) : null;

    return products.filter((p) => {
      if (catName && p.category !== catName) return false;
      if (subName && p.subcategory !== subName) return false;
      if (typeName && p.type !== typeName) return false;
      if (brandParam.length > 0 && !brandParam.includes(p.brand)) return false;
      if (minPriceParam && p.price < Number(minPriceParam)) return false;
      if (maxPriceParam && p.price > Number(maxPriceParam)) return false;
      for (const [charName, selectedValues] of Object.entries(charParams)) {
        if (selectedValues.length > 0) {
          const productValue = p.characteristics[charName];
          if (!productValue || !selectedValues.includes(productValue)) return false;
        }
      }
      return true;
    });
  }, [categoryParam, subcategoryParam, typeParam, brandParam, minPriceParam, maxPriceParam, charParams, products, categories]);

  const activeFilters = useMemo(() => {
    const filters = [];
    // category/subcategory/type не показываем — они управляются сайдбаром
    brandParam.forEach((brand) => filters.push({ id: `brand-${brand}`, type: 'brand', label: brand, value: brand }));
    if (minPriceParam || maxPriceParam) {
      const min = Number(minPriceParam);
      const max = Number(maxPriceParam);
      if (min !== 0 || max !== 0) {
        let label = '';
        if (minPriceParam && maxPriceParam) label = `От ${minPriceParam} до ${maxPriceParam} ₽`;
        else if (minPriceParam) label = `От ${minPriceParam} ₽`;
        else if (maxPriceParam) label = `До ${maxPriceParam} ₽`;
        filters.push({ id: 'price', type: 'price', label, value: 'price' });
      }
    }
    Object.entries(charParams).forEach(([charName, values]) => {
      values.forEach((val) => filters.push({ id: `char-${charName}-${val}`, type: `char_${charName}`, label: `${charName}: ${val}`, value: val }));
    });
    return filters;
  }, [brandParam, minPriceParam, maxPriceParam, charParams]);

  const removeFilter = (filter: { type: string; value: string }) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (filter.type === 'category') {
      newParams.delete('category'); newParams.delete('subcategory'); newParams.delete('type');
      for (const key of Array.from(newParams.keys())) { if (key.startsWith('char_')) newParams.delete(key); }
    } else if (filter.type === 'subcategory') {
      newParams.delete('subcategory'); newParams.delete('type');
    } else if (filter.type === 'type') {
      newParams.delete('type');
    } else if (filter.type === 'brand') {
      const currentBrands = newParams.getAll('brand');
      newParams.delete('brand');
      currentBrands.filter((b) => b !== filter.value).forEach((b) => newParams.append('brand', b));
    } else if (filter.type === 'price') {
      newParams.delete('minPrice'); newParams.delete('maxPrice');
    } else if (filter.type.startsWith('char_')) {
      const currentValues = newParams.getAll(filter.type);
      newParams.delete(filter.type);
      currentValues.filter((v) => v !== filter.value).forEach((v) => newParams.append(filter.type, v));
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => router.push('/catalog');

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
                      onClick={() => {
                        const p = new URLSearchParams();
                        p.set('category', activeCategoryObj.slug);
                        p.set('subcategory', group.slug);
                        router.push(`/catalog?${p.toString()}`);
                      }}
                      className="font-bold text-zinc-900 text-base sm:text-lg border-b border-zinc-100 pb-2 w-full text-left hover:text-emerald-600 transition-colors"
                    >
                      {group.name}
                    </button>
                    <ul className="space-y-2 sm:space-y-3">
                      {group.items.map((item) => (
                        <li key={item.slug}>
                          <button
                            onClick={() => {
                              const p = new URLSearchParams();
                              p.set('category', activeCategoryObj.slug);
                              p.set('subcategory', group.slug);
                              p.set('type', item.slug);
                              router.push(`/catalog?${p.toString()}`);
                            }}
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

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8 bg-zinc-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200/60 pb-6 gap-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">
          {typeParam
            ? typeNameBySlug(categories, categoryParam!, subcategoryParam!, typeParam)
            : subcategoryParam
            ? subcategoryNameBySlug(categories, categoryParam!, subcategoryParam)
            : categoryParam
            ? categoryNameBySlug(categories, categoryParam)
            : 'Каталог товаров'}
        </h1>
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
                <button onClick={() => { const p = new URLSearchParams(searchParams.toString()); p.delete('category'); p.delete('subcategory'); p.delete('type'); setSearchParams(p); }} className={`block text-sm font-medium transition-colors ${!categoryParam ? 'text-emerald-600 font-bold' : 'text-zinc-500 hover:text-zinc-900'}`}>Все категории</button>
                {categories.map((cat) => (
                  <div key={cat.slug}>
                    <button onClick={() => { const p = new URLSearchParams(searchParams.toString()); p.set('category', cat.slug); p.delete('subcategory'); p.delete('type'); setSearchParams(p); }} className={`block text-sm font-medium transition-colors ${categoryParam === cat.slug && !subcategoryParam ? 'text-emerald-600 font-bold' : 'text-zinc-500 hover:text-zinc-900'}`}>{cat.name}</button>
                    {categoryParam === cat.slug && cat.groups.map((group) => (
                      <div key={group.slug} className="ml-3 mt-2 space-y-1.5">
                        <button onClick={() => { const p = new URLSearchParams(searchParams.toString()); p.set('subcategory', group.slug); p.delete('type'); setSearchParams(p); }} className={`block text-sm transition-colors ${subcategoryParam === group.slug ? 'text-emerald-600 font-semibold' : 'text-zinc-400 hover:text-zinc-700'}`}>{group.name}</button>
                        {subcategoryParam === group.slug && group.items.map((item) => (
                          <button key={item.slug} onClick={() => { const p = new URLSearchParams(searchParams.toString()); p.set('type', item.slug); setSearchParams(p); }} className={`block text-xs ml-2 transition-colors ${typeParam === item.slug ? 'text-emerald-600 font-semibold' : 'text-zinc-400 hover:text-zinc-600'}`}>— {item.name}</button>
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
                  <div key={brand} className="flex items-center group">
                    <input id={`brand-${brand}`} type="checkbox" checked={brandParam.includes(brand)} onChange={() => handleBrandChange(brand)} className="h-5 w-5 rounded-md border-zinc-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
                    <label htmlFor={`brand-${brand}`} className="ml-3 text-sm font-medium text-zinc-600 group-hover:text-zinc-900 cursor-pointer transition-colors">{brand}</label>
                  </div>
                ))}
              </div>
            </div>
            {Object.entries(availableCharacteristics).map(([charName, values]) => (
              <div key={charName} className="border-t border-zinc-100 pt-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">{charName}</h3>
                <div className="mt-5 space-y-3 max-h-60 overflow-y-auto scrollbar-hide pr-2">
                  {values.map((val) => (
                    <div key={val} className="flex items-center group">
                      <input id={`char-${charName}-${val}`} type="checkbox" checked={(charParams[charName] || []).includes(val)} onChange={() => handleCharChange(charName, val)} className="h-5 w-5 rounded-md border-zinc-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
                      <label htmlFor={`char-${charName}-${val}`} className="ml-3 text-sm font-medium text-zinc-600 group-hover:text-zinc-900 cursor-pointer transition-colors">{val}</label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="border-t border-zinc-100 pt-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">Цена</h3>
              <div className="mt-5 flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400 text-sm">От</span>
                  <input type="number" className="w-full rounded-xl border border-zinc-200 pl-9 pr-3 py-2.5 text-sm font-medium focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-zinc-50" value={minPriceParam || ''} onChange={(e) => { const p = new URLSearchParams(searchParams.toString()); if (e.target.value) p.set('minPrice', e.target.value); else p.delete('minPrice'); setSearchParams(p); }} />
                </div>
                <span className="text-zinc-300">-</span>
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400 text-sm">До</span>
                  <input type="number" className="w-full rounded-xl border border-zinc-200 pl-9 pr-3 py-2.5 text-sm font-medium focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-zinc-50" value={maxPriceParam || ''} onChange={(e) => { const p = new URLSearchParams(searchParams.toString()); if (e.target.value) p.set('maxPrice', e.target.value); else p.delete('maxPrice'); setSearchParams(p); }} />
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="mt-8 lg:col-span-3 lg:mt-0">
          {activeFilters.length > 0 && (
            <div className="mb-8 flex flex-wrap items-center gap-2 bg-white p-4 rounded-2xl shadow-sm ring-1 ring-zinc-200/50">
              <span className="text-sm font-bold text-zinc-900 mr-2">Выбрано:</span>
              {activeFilters.map((filter) => (
                <span key={filter.id} className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-200 transition-colors cursor-pointer" onClick={() => removeFilter(filter)}>
                  {filter.label}<X size={14} className="text-zinc-400 hover:text-zinc-900" />
                </span>
              ))}
              <button onClick={clearAllFilters} className="ml-auto text-sm font-semibold text-rose-500 hover:text-rose-600 transition-colors">Очистить все</button>
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="flex flex-col h-64 items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-white shadow-sm">
              <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4"><Filter size={24} className="text-zinc-400" /></div>
              <p className="text-zinc-900 font-bold text-lg">Товары не найдены</p>
              <p className="text-zinc-500 font-medium text-sm mt-1">Попробуйте изменить параметры фильтрации</p>
              <button onClick={clearAllFilters} className="mt-6 px-6 py-2 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-colors">Сбросить фильтры</button>
            </div>
          ) : (
            <motion.div layout className={`grid gap-4 sm:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <motion.div key={product.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}>
                    <ProductCard product={product} viewMode={viewMode} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
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
