'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Search, X, Check, Building2, Loader2, Sparkles } from 'lucide-react';

interface DaDataSuggestion {
  value: string;
  unrestricted_value?: string;
  data?: {
    city?: string;
    city_with_type?: string;
    street_with_type?: string;
    house?: string;
    flat?: string;
    postal_code?: string;
  };
}

interface AddressFormProps {
  value: string;
  onChange: (fullAddress: string) => void;
  className?: string;
  disabled?: boolean;
}

/**
 * Парсит готовую строку адреса на базовую часть и детали (кв, подъезд, этаж, домофон)
 */
function parseAddressString(raw: string) {
  if (!raw) {
    return { base: '', flat: '', entrance: '', floor: '', intercom: '' };
  }

  let base = raw;
  let flat = '';
  let entrance = '';
  let floor = '';
  let intercom = '';

  // Извлекаем домофон
  const intercomMatch = base.match(/(?:домофон:?\s*|код:?\s*)([0-9a-zA-Zа-яА-Я#*]+)/i);
  if (intercomMatch) {
    intercom = intercomMatch[1].trim();
  }

  // Извлекаем этаж
  const floorMatch = base.match(/(?:эт(?:аж)?\.?\s*)([0-9-]+)/i);
  if (floorMatch) {
    floor = floorMatch[1].trim();
  }

  // Извлекаем подъезд
  const entranceMatch = base.match(/(?:под(?:ъезд)?\.?\s*)([0-9a-zA-Zа-яА-Я-]+)/i);
  if (entranceMatch) {
    entrance = entranceMatch[1].trim();
  }

  // Извлекаем квартиру
  const flatMatch = base.match(/(?:кв(?:артира)?\.?\s*|оф(?:ис)?\.?\s*)([0-9a-zA-Zа-яА-Я-]+)/i);
  if (flatMatch) {
    flat = flatMatch[1].trim();
  }

  // Очищаем базовый адрес от извлеченных скобок и уточнений
  base = base
    .replace(/\s*\([^)]*\)/g, '') // удаляем то, что в скобках
    .replace(/,\s*кв(?:артира)?\.?\s*[0-9a-zA-Zа-яА-Я-]+/gi, '')
    .replace(/,\s*оф(?:ис)?\.?\s*[0-9a-zA-Zа-яА-Я-]+/gi, '')
    .replace(/,\s*под(?:ъезд)?\.?\s*[0-9a-zA-Zа-яА-Я-]+/gi, '')
    .replace(/,\s*эт(?:аж)?\.?\s*[0-9-]+/gi, '')
    .trim()
    .replace(/,$/, '');

  return { base: base || raw, flat, entrance, floor, intercom };
}

export function AddressForm({ value, onChange, className = '', disabled = false }: AddressFormProps) {
  const parsed = parseAddressString(value);

  const [baseAddress, setBaseAddress] = useState(parsed.base);
  const [flat, setFlat] = useState(parsed.flat);
  const [entrance, setEntrance] = useState(parsed.entrance);
  const [floor, setFloor] = useState(parsed.floor);
  const [intercom, setIntercom] = useState(parsed.intercom);

  const [query, setQuery] = useState(parsed.base);
  const [suggestions, setSuggestions] = useState<DaDataSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const flatInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Синхронизация при внешнем изменении value (например, подгрузка профиля)
  useEffect(() => {
    const next = parseAddressString(value);
    setBaseAddress(next.base);
    setQuery(next.base);
    setFlat(next.flat);
    setEntrance(next.entrance);
    setFloor(next.floor);
    setIntercom(next.intercom);
  }, [value]);

  // Сборка полного адреса и передача родителю
  const emitFullAddress = useCallback(
    (b: string, fl: string, ent: string, flr: string, intc: string) => {
      const cleanBase = b.trim();
      if (!cleanBase) {
        onChange('');
        return;
      }

      const parts: string[] = [cleanBase];

      if (fl.trim()) {
        parts.push(`кв. ${fl.trim()}`);
      }

      const extras: string[] = [];
      if (ent.trim()) extras.push(`подъезд ${ent.trim()}`);
      if (flr.trim()) extras.push(`этаж ${flr.trim()}`);
      if (intc.trim()) extras.push(`домофон: ${intc.trim()}`);

      let full = parts.join(', ');
      if (extras.length > 0) {
        full += ` (${extras.join(', ')})`;
      }

      onChange(full);
    },
    [onChange]
  );

  // Закрытие выпадающего списка при клике вне компонента
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Запрос подсказок DaData с дебаунсом 250мс
  const fetchSuggestions = (searchQuery: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/address/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery.trim(), count: 5 }),
        });

        if (res.ok) {
          const data = await res.json();
          const items: DaDataSuggestion[] = data.suggestions || [];
          setSuggestions(items);
          setIsOpen(items.length > 0);
          setSelectedIndex(-1);
        } else {
          setSuggestions([]);
          setIsOpen(false);
        }
      } catch {
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 250);
  };

  const handleQueryChange = (text: string) => {
    setQuery(text);
    setBaseAddress(text);
    emitFullAddress(text, flat, entrance, floor, intercom);
    fetchSuggestions(text);
  };

  const handleSelectSuggestion = (suggestion: DaDataSuggestion) => {
    const selectedText = suggestion.value;
    setQuery(selectedText);
    setBaseAddress(selectedText);
    setIsOpen(false);
    setSuggestions([]);
    emitFullAddress(selectedText, flat, entrance, floor, intercom);

    // Автофокус на ввод квартиры
    setTimeout(() => {
      flatInputRef.current?.focus();
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`space-y-3.5 ${className}`}>
      {/* Основная строка: Город, улица, дом с автодополнением DaData */}
      <div className="relative">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
            <span>Адрес (город, улица, дом)</span>
          </label>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md ring-1 ring-emerald-600/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Подсказки ФИАС
          </span>
        </div>

        <div className="relative">
          <MapPin
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
          />

          <input
            type="text"
            value={query}
            disabled={disabled}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setIsOpen(true);
              else if (query.trim().length >= 2) fetchSuggestions(query);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Начните вводить: Москва Тверская 12..."
            className="w-full rounded-2xl border border-zinc-200/90 bg-zinc-50/70 py-3 pl-10 pr-10 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          />

          {/* Индикатор загрузки или кнопка очистки */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isLoading && <Loader2 size={16} className="animate-spin text-emerald-500" />}
            {query && !isLoading && !disabled && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setBaseAddress('');
                  setSuggestions([]);
                  setIsOpen(false);
                  emitFullAddress('', flat, entrance, floor, intercom);
                }}
                className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg transition-colors"
                aria-label="Очистить адрес"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Выпадающий список подсказок DaData */}
        {isOpen && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl max-h-64 overflow-y-auto">
            <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 bg-zinc-50 border-b border-zinc-100">
              Выберите адрес из реестра
            </div>
            <ul className="divide-y divide-zinc-100">
              {suggestions.map((item, index) => {
                const isSelected = selectedIndex === index;
                return (
                  <li key={item.value + index}>
                    <button
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left text-xs sm:text-sm transition-colors ${
                        isSelected ? 'bg-emerald-50/80 text-emerald-950' : 'text-zinc-800 hover:bg-zinc-50'
                      }`}
                    >
                      <MapPin
                        size={15}
                        className={`mt-0.5 shrink-0 ${
                          isSelected ? 'text-emerald-600' : 'text-zinc-400'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold block truncate">{item.value}</span>
                        {item.data?.postal_code && (
                          <span className="text-[11px] text-zinc-400 block mt-0.5 font-medium">
                            Индекс: {item.data.postal_code}
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Ряд уточняющих полей: Квартира / Офис, Подъезд, Этаж, Домофон */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Квартира / Офис */}
        <div>
          <label className="mb-1 block text-[11px] font-bold text-zinc-700">
            Кв. / Офис
          </label>
          <input
            ref={flatInputRef}
            type="text"
            value={flat}
            disabled={disabled}
            onChange={(e) => {
              const val = e.target.value;
              setFlat(val);
              emitFullAddress(baseAddress, val, entrance, floor, intercom);
            }}
            placeholder="кв. 42"
            className="w-full rounded-xl border border-zinc-200/90 bg-zinc-50/70 py-2.5 px-3 text-xs sm:text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>

        {/* Подъезд */}
        <div>
          <label className="mb-1 block text-[11px] font-bold text-zinc-700">
            Подъезд
          </label>
          <input
            type="text"
            value={entrance}
            disabled={disabled}
            onChange={(e) => {
              const val = e.target.value;
              setEntrance(val);
              emitFullAddress(baseAddress, flat, val, floor, intercom);
            }}
            placeholder="1"
            className="w-full rounded-xl border border-zinc-200/90 bg-zinc-50/70 py-2.5 px-3 text-xs sm:text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>

        {/* Этаж */}
        <div>
          <label className="mb-1 block text-[11px] font-bold text-zinc-700">
            Этаж
          </label>
          <input
            type="text"
            value={floor}
            disabled={disabled}
            onChange={(e) => {
              const val = e.target.value;
              setFloor(val);
              emitFullAddress(baseAddress, flat, entrance, val, intercom);
            }}
            placeholder="5"
            className="w-full rounded-xl border border-zinc-200/90 bg-zinc-50/70 py-2.5 px-3 text-xs sm:text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>

        {/* Домофон */}
        <div>
          <label className="mb-1 block text-[11px] font-bold text-zinc-700">
            Домофон / Код
          </label>
          <input
            type="text"
            value={intercom}
            disabled={disabled}
            onChange={(e) => {
              const val = e.target.value;
              setIntercom(val);
              emitFullAddress(baseAddress, flat, entrance, floor, val);
            }}
            placeholder="42K"
            className="w-full rounded-xl border border-zinc-200/90 bg-zinc-50/70 py-2.5 px-3 text-xs sm:text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>
      </div>
    </div>
  );
}
