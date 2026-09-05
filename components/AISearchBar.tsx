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
  const [isFocused, setIsFocused] = useState(false);

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
      className={`flex items-center gap-1.5 sm:gap-2 min-w-0 ${className}`}
    >
      {/* Поле ввода в стиле Spotlight / Raycast */}
      <div
        className={`relative flex-1 min-w-0 rounded-2xl transition-all duration-300 ${
          isFocused
            ? 'ring-4 ring-emerald-500/10 shadow-sm'
            : 'hover:border-zinc-300'
        }`}
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <Search
            className={`h-4 w-4 transition-colors duration-200 ${
              isFocused ? 'text-emerald-500' : 'text-zinc-400'
            }`}
          />
        </div>
        <input
          type="text"
          value={query}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => setQuery(e.target.value)}
          className="block w-full rounded-2xl border border-zinc-200/90 bg-zinc-100/60 py-2 sm:py-2.5 pl-10 pr-9 text-xs sm:text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
          placeholder={isAI ? 'ИИ-поиск: «ноутбук для работы»...' : 'Поиск по каталогу...'}
        />

        {/* Clear button */}
        {query && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-2.5">
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors"
              aria-label="Очистить"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Кнопка Поиск */}
      <button
        type="submit"
        disabled={!query.trim() || isSubmitting}
        className="shimmer-btn flex items-center gap-1.5 rounded-2xl bg-zinc-950 px-3.5 py-2 sm:py-2.5 text-xs font-bold text-white whitespace-nowrap shadow-sm hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
      >
        {isSubmitting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
        ) : (
          <Search className="h-3.5 w-3.5" />
        )}
        <span className="hidden sm:inline">Поиск</span>
      </button>

      {/* Переключатель AI / 1С */}
      <button
        type="button"
        onClick={() => setIsAI((v) => !v)}
        className={`flex items-center gap-1 rounded-2xl border px-2.5 py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all shadow-2xs ${
          isAI
            ? 'border-emerald-500/40 bg-emerald-50/90 text-emerald-700 ring-1 ring-emerald-500/20 hover:bg-emerald-100/80'
            : 'border-zinc-200/90 bg-zinc-100/70 text-zinc-500 hover:bg-zinc-200/60 hover:text-zinc-800'
        }`}
        title={isAI ? 'ИИ-поиск активен. Нажмите для переключения' : 'Поиск из 1С активен. Нажмите для переключения'}
      >
        <Sparkles
          className={`h-3.5 w-3.5 transition-transform ${
            isAI ? 'text-emerald-600 scale-110' : 'text-zinc-400'
          }`}
        />
        <span>{isAI ? 'AI' : '1С'}</span>
      </button>
    </form>
  );
}
