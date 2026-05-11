'use client';

import React, { useState, useEffect } from 'react';
import { Search, Loader2, X, Sparkles } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface AISearchBarProps {
  className?: string;
  onResultClick?: () => void;
}

export function AISearchBar({ className = '', onResultClick }: AISearchBarProps) {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const pathname = usePathname();
  const router = useRouter();
  const isSearchPage = pathname === '/search';

  const urlAI = searchParams.get('ai') === '1';

  const [query, setQuery] = useState(urlQuery);
  const [isAI, setIsAI] = useState(isSearchPage ? urlAI : true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Синхронизируем поле и режим с URL на странице поиска
  useEffect(() => {
    if (isSearchPage) {
      setQuery(urlQuery);
      setIsAI(searchParams.get('ai') === '1');
    }
  }, [urlQuery, isSearchPage, searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    onResultClick?.();
    const params = new URLSearchParams({ q: trimmed });
    if (isAI) params.set('ai', '1');
    router.push(`/search?${params.toString()}`);
    setTimeout(() => setIsSubmitting(false), 500);
  };

  const handleClear = () => {
    setQuery('');
    if (isSearchPage) router.replace('/search');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center gap-2 min-w-0 ${className}`}
    >
      {/* Поле ввода */}
      <div className="relative flex-1 min-w-0">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-zinc-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="block w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-10 pr-10 text-sm placeholder:text-zinc-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
          placeholder={isAI ? 'AI-поиск товаров...' : 'Поиск по каталогу...'}
        />
        {query && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <button
              type="button"
              onClick={handleClear}
              className="text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Кнопка Поиск */}
      <button
        type="submit"
        disabled={!query.trim() || isSubmitting}
        className="flex items-center gap-1.5 rounded-2xl bg-zinc-900 px-3 py-2.5 text-xs font-bold text-white whitespace-nowrap hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        {isSubmitting
          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
          : <Search className="h-3.5 w-3.5" />
        }
        Поиск
      </button>

      {/* Переключатель AI / 1С */}
      <button
        type="button"
        onClick={() => setIsAI((v) => !v)}
        className={`flex items-center gap-1.5 rounded-2xl border px-3 py-2.5 text-xs font-bold whitespace-nowrap transition-all ${
          isAI
            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
            : 'border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-zinc-300'
        }`}
        title={isAI ? 'Переключить на поиск из 1С' : 'Переключить на AI-поиск'}
      >
        <Sparkles className={`h-3.5 w-3.5 ${isAI ? 'text-emerald-500' : 'text-zinc-400'}`} />
        {isAI ? 'AI' : '1С'}
      </button>
    </form>
  );
}
