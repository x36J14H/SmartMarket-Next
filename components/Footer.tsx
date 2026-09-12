'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Tag, Send, ShieldCheck, CreditCard } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useChatStore } from '../store/chatStore';
import { settingsService, DEFAULT_STORE_SETTINGS, type StoreSettings } from '../lib/1c/settings';

export function Footer() {
  const [email, setEmail] = useState('');
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  useEffect(() => {
    settingsService.getSettings().then(setStoreSettings);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Пожалуйста, укажите корректный email');
      return;
    }
    toast.success('Спасибо за подписку на закрытые предложения и акции!');
    setEmail('');
  };

  return (
    <footer className="border-t border-zinc-200/80 bg-white/95 backdrop-blur-xl transition-colors">
      {/* Клуб привилегий и закрытых скидок */}
      <div className="border-b border-zinc-100 bg-zinc-50/70 py-10 sm:py-12">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 mb-3">
                <Tag size={12} className="text-emerald-600" />
                <span>Клуб привилегий</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-950 font-display tracking-tight">
                Узнавайте о закрытых распродажах первыми
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-zinc-500 font-normal">
                Эксклюзивные промокоды, ранний доступ к новинкам и персональные рекомендации.
              </p>
            </div>

            <div className="w-full max-w-md">
              <form onSubmit={handleSubscribe} className="flex w-full items-center gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ваш рабочий email..."
                    className="w-full rounded-2xl border border-zinc-200 bg-white py-3 pl-10 pr-4 text-xs sm:text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="shimmer-btn flex items-center gap-1.5 rounded-2xl bg-zinc-950 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-zinc-800 active:scale-95 transition-all shrink-0"
                >
                  <span>Подписаться</span>
                  <Send size={13} />
                </button>
              </form>
              <p className="mt-2 text-[11px] text-zinc-400 font-normal leading-tight text-center md:text-left">
                Нажимая «Подписаться», вы соглашаетесь с{' '}
                <Link href="/privacy" className="underline hover:text-zinc-700 transition-colors">
                  Политикой обработки персональных данных
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-5 lg:gap-10">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-zinc-950 group">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm transition-transform group-hover:scale-105">
                <span className="text-emerald-400 font-display font-black text-base">S</span>
              </div>
              <span className="font-display font-extrabold text-xl tracking-tight text-zinc-950">
                Smart<span className="text-emerald-600">Market</span>
              </span>
            </Link>

            <p className="mt-4 text-sm text-zinc-500 leading-relaxed font-normal max-w-sm">
              Премиальный интернет-магазин оригинальной электроники и гаджетов. Быстрая доставка по всей России, официальная гарантия и высокий уровень клиентского сервиса.
            </p>

            {/* Badges */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-lg bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-700">
                <ShieldCheck size={13} className="text-emerald-600" />
                100% Оригинал
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-700">
                <CreditCard size={13} className="text-blue-600" />
                СБП & Долями
              </span>
            </div>
          </div>

          {/* Col 2: Buyers */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-950">
              Покупателям
            </h4>
            <ul className="mt-5 space-y-3 text-sm font-medium text-zinc-500">
              <li>
                <Link href="/catalog" className="hover:text-emerald-600 transition-colors">
                  Каталог товаров
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="hover:text-emerald-600 transition-colors">
                  Избранное
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-emerald-600 transition-colors">
                  Корзина
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-emerald-600 transition-colors">
                  Мои заказы
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-emerald-600 transition-colors">
                  Возврат и гарантия
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-950">
              Компания
            </h4>
            <ul className="mt-5 space-y-3 text-sm font-medium text-zinc-500">
              <li>
                <Link href="/about" className="hover:text-emerald-600 transition-colors">
                  О магазине
                </Link>
              </li>
              <li>
                <Link href="/contacts" className="hover:text-emerald-600 transition-colors">
                  Контакты и адрес
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-emerald-600 transition-colors">
                  Пользовательское соглашение
                </Link>
              </li>
              <li>
                <button
                  onClick={() => useChatStore.getState().openChat()}
                  className="hover:text-emerald-600 transition-colors text-left flex items-center gap-1"
                >
                  <span>Чат-консультант</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contacts & Hours */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-950">
              Служба заботы
            </h4>
            <ul className="mt-5 space-y-3.5 text-sm font-medium text-zinc-500">
              <li className="flex items-center gap-2.5">
                <Phone size={15} className="text-emerald-600 shrink-0" />
                <a href={`tel:${storeSettings.phone.replace(/[^0-9+]/g, '')}`} className="hover:text-emerald-600 font-bold text-zinc-900 transition-colors">
                  {storeSettings.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={15} className="text-emerald-600 shrink-0" />
                <a href={`mailto:${storeSettings.email}`} className="hover:text-emerald-600 transition-colors">
                  {storeSettings.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="text-zinc-400 mt-0.5 shrink-0" />
                <span className="text-xs text-zinc-500">г. {storeSettings.city}, {storeSettings.address}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 border-t border-zinc-100 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-medium text-zinc-400">
          <p>
            &copy; {new Date().getFullYear()} SmartMarket. Все права защищены. Интернет-магазин оригинальной электроники.
          </p>
          <div className="flex flex-wrap gap-6 items-center justify-center sm:justify-end">
            <Link href="/privacy" className="hover:text-zinc-900 transition-colors">
              Политика конфиденциальности
            </Link>
            <Link href="/terms" className="hover:text-zinc-900 transition-colors">
              Пользовательское соглашение
            </Link>
            <Link href="/returns" className="hover:text-zinc-900 transition-colors">
              Условия возврата и гарантии
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
