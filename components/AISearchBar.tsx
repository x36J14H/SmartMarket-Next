'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, Loader2, X } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { searchProductsWithAI } from '../services/aiSearch';
import { Product } from '../types';
import { formatPrice } from '../lib/utils';
import { useProductsStore } from '../store/productsStore';

interface AISearchBarProps {
  className?: string;
  onResultClick?: () => void;
}

export function AISearchBar({ className = '', onResultClick }: AISearchBarProps) {
  const products = useProductsStore((s) => s.products);
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const pathname = usePathname();
  const router = useRouter();
  const isSearchPage = pathname === '/search';

  const [query, setQuery] = useState(urlQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSearchPage) setQuery(urlQuery);
  }, [urlQuery, isSearchPage]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSearchPage && query === urlQuery) { setIsOpen(false); return; }

    const timer = setTimeout(async () => {
      if (query.trim().length > 2) {
        if (isSearchPage) {
          router.replace(`/search?q=${encodeURIComponent(query.trim())}`);
          setIsOpen(false);
        } else {
          setIsSearching(true);
          setIsOpen(true);
          const searchResults = await searchProductsWithAI(query, products);
          setResults(searchResults);
          setIsSearching(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
        if (isSearchPage && query.trim().length === 0 && urlQuery !== '') {
          router.replace('/search');
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, isSearchPage, router, urlQuery, products]);

  const handleProductClick = (slug: string) => {
    setIsOpen(false);
    setQuery('');
    onResultClick?.();
    router.push(`/product/${slug}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      onResultClick?.();
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div ref={wrapperRef} className={`relative w-full max-w-md ${className}`}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Sparkles className="h-4 w-4 text-emerald-500" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (!isSearchPage && query.trim().length > 2) setIsOpen(true); }}
          className="block w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-10 pr-10 text-sm placeholder:text-zinc-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
          placeholder="AI поиск товаров..."
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2">
          {query && (
            <button type="button" onClick={() => { setQuery(''); if (isSearchPage) router.replace('/search'); }} className="text-zinc-400 hover:text-zinc-600 transition-colors">
              <X className="h-4 w-4" />
            </button>
          )}
          <button type="submit" className="text-zinc-400 hover:text-emerald-600 disabled:opacity-50 transition-colors" disabled={!query.trim()}>
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin text-emerald-500" /> : <Search className="h-4 w-4" />}
          </button>
        </div>
      </form>

      {isOpen && !isSearchPage && (
        <div className="absolute top-full z-50 mt-2 max-h-96 w-full overflow-y-auto rounded-2xl border border-zinc-200 bg-white py-2 shadow-xl shadow-zinc-200/50">
          {isSearching ? (
            <div className="flex items-center justify-center py-8 text-sm text-zinc-500 font-medium">
              <Loader2 className="mr-3 h-5 w-5 animate-spin text-emerald-500" />
              ИИ ищет подходящие товары...
            </div>
          ) : results.length > 0 ? (
            <ul className="divide-y divide-zinc-100">
              {results.slice(0, 5).map((product) => (
                <li key={product.id}>
                  <button onClick={() => handleProductClick(product.slug)} className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-zinc-50">
                    <img src={product.imageUrl} alt={product.name} className="h-12 w-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                    <div className="flex-1 overflow-hidden">
                      <h4 className="truncate text-sm font-bold text-zinc-900">{product.name}</h4>
                      <p className="truncate text-xs font-medium text-zinc-500 mt-0.5">{product.category} • {product.brand}</p>
                    </div>
                    <div className="text-sm font-extrabold text-zinc-900">{formatPrice(product.price)}</div>
                  </button>
                </li>
              ))}
              <li className="border-t border-zinc-100 p-2">
                <button onClick={() => { setIsOpen(false); onResultClick?.(); router.push(`/search?q=${encodeURIComponent(query.trim())}`); }} className="flex w-full items-center justify-center rounded-xl py-3 text-sm font-bold text-emerald-600 hover:bg-emerald-50 transition-colors">
                  Показать все результаты
                </button>
              </li>
            </ul>
          ) : query.trim().length > 2 ? (
            <div className="py-8 text-center text-sm font-medium text-zinc-500">По вашему запросу ничего не найдено</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
