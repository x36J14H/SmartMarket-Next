'use client';

import React from 'react';
import Link from 'next/link';
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag, CheckSquare, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { useCartStore } from '../../store/cartStore';
import { formatPrice } from '../../lib/utils';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [showFloatingBar, setShowFloatingBar] = React.useState(true);
  const checkoutBtnRef = React.useRef<HTMLAnchorElement>(null);

  // Сбрасываем выбор если товар удалён
  React.useEffect(() => {
    const ids = new Set(items.map((i) => i.id));
    setSelected((prev) => {
      const next = new Set([...prev].filter((id) => ids.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [items]);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowFloatingBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (checkoutBtnRef.current) observer.observe(checkoutBtnRef.current);
    return () => observer.disconnect();
  }, [items.length]);

  React.useEffect(() => {
    document.documentElement.classList.toggle('has-floating-bar', showFloatingBar);
    return () => document.documentElement.classList.remove('has-floating-bar');
  }, [showFloatingBar]);

  const allSelected = items.length > 0 && selected.size === items.length;
  const someSelected = selected.size > 0;

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((i) => i.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const deleteSelected = async () => {
    const ids = [...selected];
    setSelected(new Set());
    await Promise.all(ids.map((id) => removeItem(id)));
  };

  const handleClearCart = async () => {
    setSelected(new Set());
    await clearCart();
  };

  // Сумма только выбранных (или всех если ничего не выбрано)
  const displayItems = someSelected ? items.filter((i) => selected.has(i.id)) : items;
  const displayTotal = displayItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const displayQty = displayItems.reduce((sum, i) => sum + i.quantity, 0);

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center bg-zinc-50"
      >
        <div className="rounded-full bg-white p-8 shadow-sm ring-1 ring-zinc-200/50 mb-8">
          <ShoppingBag className="h-16 w-16 text-zinc-300" />
        </div>
        <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Ваша корзина пуста</h2>
        <p className="mt-3 text-lg text-zinc-500 font-medium max-w-md">
          Самое время добавить в нее что-нибудь из нашего каталога.
        </p>
        <Link
          href="/catalog"
          className="mt-10 inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-8 py-4 text-base font-bold text-white shadow-md transition-all hover:bg-zinc-800 hover:-translate-y-0.5"
        >
          Перейти к покупкам
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-4 sm:py-8 sm:px-6 lg:px-8 bg-zinc-50 min-h-screen">
      {/* Заголовок */}
      <div className="flex items-end justify-between border-b border-zinc-200/60 pb-4 mb-6 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">Корзина</h1>
        <span className="text-zinc-500 font-medium mb-1">
          {items.length}{' '}
          {items.length === 1 ? 'товар' : items.length > 1 && items.length < 5 ? 'товара' : 'товаров'}
        </span>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-8 xl:gap-x-12">
        <section className="lg:col-span-7">
          {/* Панель выбора */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={toggleAll}
              className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              {allSelected ? (
                <CheckSquare size={18} className="text-emerald-500" />
              ) : (
                <Square size={18} className="text-zinc-400" />
              )}
              {allSelected ? 'Снять выбор' : 'Выбрать все'}
            </button>

            <div className="flex items-center gap-3">
              <AnimatePresence>
                {someSelected && !allSelected && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={deleteSelected}
                    className="flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-600 hover:bg-rose-100 transition-colors"
                  >
                    <Trash2 size={14} />
                    Удалить выбранные ({selected.size})
                  </motion.button>
                )}
              </AnimatePresence>

              <button
                onClick={handleClearCart}
                className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold text-zinc-400 hover:bg-zinc-100 hover:text-rose-500 transition-colors"
              >
                <Trash2 size={14} />
                <span className="hidden sm:inline">Очистить корзину</span>
              </button>
            </div>
          </div>

          {/* Список товаров */}
          <ul role="list" className="space-y-4 sm:space-y-6">
            <AnimatePresence>
              {items.map((item) => {
                const isSelected = selected.has(item.id);
                return (
                  <motion.li
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    className={`flex flex-row p-2 sm:p-6 bg-white rounded-3xl shadow-sm ring-1 transition-all hover:shadow-md gap-3 sm:gap-6 ${
                      isSelected ? 'ring-emerald-300 bg-emerald-50/30' : 'ring-zinc-200/50'
                    }`}
                  >
                    {/* Чекбокс */}
                    <button
                      onClick={() => toggleOne(item.id)}
                      className="shrink-0 self-center p-1 -ml-1 sm:ml-0"
                      aria-label={isSelected ? 'Снять выбор' : 'Выбрать товар'}
                    >
                      {isSelected ? (
                        <CheckSquare size={20} className="text-emerald-500" />
                      ) : (
                        <Square size={20} className="text-zinc-300 hover:text-zinc-400 transition-colors" />
                      )}
                    </button>

                    <div className="shrink-0">
                      <div className="relative h-20 w-[60px] sm:h-28 sm:w-[84px] rounded-xl sm:rounded-2xl overflow-hidden shadow-sm ring-1 ring-zinc-200/50">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          sizes="84px"
                          className="object-cover"
                        />
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col justify-center">
                      <div className="flex flex-row sm:grid sm:grid-cols-2 justify-between items-center sm:items-start sm:gap-x-6">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-lg font-bold leading-tight line-clamp-1 sm:line-clamp-2">
                            <Link
                              href={`/product/${item.slug}`}
                              className="text-zinc-900 hover:text-emerald-600 transition-colors"
                            >
                              {item.name}
                            </Link>
                          </h3>
                          <div className="mt-0.5 sm:mt-2 flex text-[10px] sm:text-sm font-medium">
                            <p className="text-zinc-500 bg-zinc-50 px-1.5 py-0.5 rounded-md">{item.brand}</p>
                          </div>
                          <p className="mt-1 sm:mt-4 text-base sm:text-xl font-extrabold text-zinc-900 tracking-tight">
                            {formatPrice(item.price)}
                          </p>
                        </div>

                        <div className="flex flex-col items-end justify-between sm:justify-center gap-2 sm:gap-0 shrink-0">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="sm:hidden inline-flex p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <div className="flex items-center rounded-xl border border-zinc-200 bg-zinc-50 p-0.5 sm:p-1">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1.5 sm:p-2 text-zinc-400 hover:text-zinc-900 hover:bg-white rounded-lg transition-all shadow-sm"
                              >
                                <Minus size={14} className="sm:hidden" />
                                <Minus size={16} className="hidden sm:block" />
                              </button>
                              <span className="w-8 sm:w-10 text-center text-xs sm:text-sm font-bold text-zinc-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1.5 sm:p-2 text-zinc-400 hover:text-zinc-900 hover:bg-white rounded-lg transition-all shadow-sm"
                              >
                                <Plus size={14} className="sm:hidden" />
                                <Plus size={16} className="hidden sm:block" />
                              </button>
                            </div>
                          </div>
                          <div className="hidden sm:block">
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="inline-flex p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                            >
                              <span className="sr-only">Удалить</span>
                              <Trash2 className="h-5 w-5" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </section>

        {/* Сайдбар с суммой */}
        <section className="mt-8 sm:mt-16 rounded-3xl bg-white p-6 sm:p-8 lg:col-span-5 lg:mt-0 shadow-sm ring-1 ring-zinc-200/50 sticky top-24">
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight mb-6 sm:mb-8">
            Сумма заказа
          </h2>
          <dl className="space-y-4 sm:space-y-5 text-sm font-medium text-zinc-600">
            <div className="flex items-center justify-between">
              <dt>Товары ({displayQty})</dt>
              <dd className="font-bold text-zinc-900">{formatPrice(displayTotal)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Скидка</dt>
              <dd className="font-bold text-emerald-600">0 ₽</dd>
            </div>
            <div className="flex items-center justify-between border-t border-zinc-100 pt-4 sm:pt-6 mt-4 sm:mt-6">
              <dt className="text-base sm:text-lg font-extrabold text-zinc-900">Итого к оплате</dt>
              <dd className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                {formatPrice(displayTotal)}
              </dd>
            </div>
          </dl>
          <div className="mt-8 space-y-3">
            <Link
              ref={checkoutBtnRef}
              href="/checkout"
              className="flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-4 text-base font-bold text-white shadow-md hover:bg-emerald-600 hover:-translate-y-0.5 transition-all"
            >
              Перейти к оформлению
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <p className="text-xs text-center text-zinc-400 font-medium">
              Доступны способы оплаты: Картой, СБП, Долями
            </p>
          </div>
        </section>
      </div>

      {/* Мобильная плавающая панель */}
      <AnimatePresence>
        {showFloatingBar && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 border-t border-zinc-200 p-4 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] backdrop-blur-lg"
          >
            <div className="flex items-center justify-between max-w-md mx-auto gap-4">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  {displayQty} шт.{someSelected && ` (из ${getTotalItems()})`}
                </span>
                <span className="text-xl font-extrabold text-zinc-900 tracking-tight">
                  {formatPrice(displayTotal)}
                </span>
              </div>
              <Link
                href="/checkout"
                className="flex-1 flex items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                Оформить
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
