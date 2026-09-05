'use client';

import Link from 'next/link';
import {
  ArrowRight,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Zap,
  Bot,
  PackageCheck,
  TrendingUp,
  Percent,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { useProductsStore } from '../store/productsStore';
import { fetchCatalog } from '../lib/1c/catalog';
import type { Product } from '../types';
import Particles from '../components/Particles';

export default function HomePage() {
  const { categories } = useProductsStore();
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'hits' | 'new'>('all');

  useEffect(() => {
    fetchCatalog({ page: 1, limit: 8 })
      .then(({ products }) => setPopularProducts(products))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openAiWithPrompt = (promptText: string) => {
    // Находим кнопку открытия ИИ-чата и отправляем клик
    const aiBtn = document.querySelector<HTMLButtonElement>('button[aria-label="Открыть чат с ИИ"]');
    if (aiBtn) {
      aiBtn.click();
      // Заполняем инпут чата через небольшую задержку
      setTimeout(() => {
        const input = document.querySelector<HTMLInputElement>('input[placeholder="Напишите сообщение..."]');
        if (input) {
          input.value = promptText;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.focus();
        }
      }, 350);
    }
  };

  const filteredProducts = popularProducts.filter((p, index) => {
    if (activeTab === 'hits') return index % 2 === 0;
    if (activeTab === 'new') return index % 2 !== 0;
    return true;
  });

  return (
    <div className="flex flex-col gap-20 sm:gap-28 pb-24 overflow-hidden">
      {/* 1. Hero — Flagship Viewport Presentation */}
      <section
        className="relative overflow-hidden"
        style={{ minHeight: 'calc(100vh - 64px)' }}
      >
        {/* Deep space radial background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_15%,_#09131d_0%,_#05080e_55%,_#020407_100%)]" />

        {/* Luminous nebula glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-15%] left-[30%] h-[750px] w-[750px] -translate-x-1/2 rounded-full bg-emerald-600/15 blur-[160px]" />
          <div className="absolute top-[20%] right-[-5%] h-[550px] w-[550px] rounded-full bg-teal-500/10 blur-[140px]" />
          <div className="absolute bottom-[-10%] left-[5%] h-[500px] w-[500px] rounded-full bg-indigo-600/15 blur-[130px]" />
        </div>

        {/* 3D WebGL Particles */}
        <div className="absolute inset-0 pointer-events-auto">
          <Particles
            particleColors={['#ffffff', '#a7f3d0', '#67e8f9', '#6ee7b7', '#c4b5fd']}
            particleCount={260}
            particleSpread={13}
            speed={0.06}
            particleBaseSize={85}
            moveParticlesOnHover={true}
            particleHoverFactor={0.35}
            alphaParticles={true}
            sizeRandomness={1.25}
            cameraDistance={22}
            disableRotation={false}
            pixelRatio={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex min-h-[calc(100vh-64px)] flex-col justify-between px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
          <div className="my-auto mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-emerald-300 ring-1 ring-inset ring-white/15 mb-6 sm:mb-8 backdrop-blur-xl shadow-inner-glow"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>SmartMarket 2.0 • Премиальный шопинг без посредников</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.1]"
            >
              Покупки будущего{' '}
              <br className="hidden sm:block" />
              <span className="text-gradient-emerald">
                с интеллектом ИИ
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 sm:mt-8 text-base sm:text-xl text-zinc-300 leading-relaxed max-w-2xl mx-auto font-normal"
            >
              Прямые цены склада без комиссий маркетплейсов. Мгновенная синхронизация
              с 1С, персональный ИИ-ассистент и официальная гарантия на каждый товар.
            </motion.p>

            {/* Hero CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3.5 sm:gap-4 justify-center items-center"
            >
              <Link
                href="/catalog"
                className="shimmer-btn inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-4 text-sm sm:text-base font-bold text-zinc-950 transition-all hover:bg-emerald-400 hover:scale-105 hover:shadow-glow-emerald w-full sm:w-auto"
              >
                <span>Перейти в каталог</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>

              <button
                onClick={() => openAiWithPrompt('Помоги подобрать лучший товар по цене и качеству')}
                className="inline-flex items-center justify-center rounded-full bg-white/10 px-7 py-4 text-sm sm:text-base font-bold text-white ring-1 ring-inset ring-white/20 backdrop-blur-xl transition-all hover:bg-white/20 hover:scale-105 w-full sm:w-auto"
              >
                <Bot className="mr-2 h-5 w-5 text-emerald-400" />
                <span>Спросить ИИ-консультанта</span>
              </button>
            </motion.div>
          </div>

          {/* Hero Value Metrics Strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mx-auto w-full max-w-5xl mt-12 pt-8 border-t border-white/10"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="flex flex-col items-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-white font-display">0%</span>
                <span className="text-xs sm:text-sm font-medium text-zinc-400 mt-0.5">Комиссий маркетплейсов</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-display">&lt; 0.5с</span>
                <span className="text-xs sm:text-sm font-medium text-zinc-400 mt-0.5">Умный ИИ-поиск</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-white font-display">100%</span>
                <span className="text-xs sm:text-sm font-medium text-zinc-400 mt-0.5">Оригинальная продукция</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-display">1С</span>
                <span className="text-xs sm:text-sm font-medium text-zinc-400 mt-0.5">Точные складские остатки</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Bento-Grid: Why SmartMarket */}
      <section className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-600">
            Преимущества
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 font-display">
            Шопинг без посредников и наценок
          </h2>
          <p className="mt-3 text-base text-zinc-500 font-normal leading-relaxed">
            Мы объединили прямой доступ к складам поставщиков и искусственный интеллект,
            чтобы создать идеальный магазин.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Bento Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-sm hover:border-emerald-500/30 hover:shadow-xl transition-all"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20 group-hover:scale-110 transition-transform">
              <Percent size={24} />
            </div>
            <div className="mt-8">
              <h3 className="text-xl font-bold text-zinc-950 tracking-tight">Честные цены</h3>
              <p className="mt-2 text-sm text-zinc-500 leading-relaxed font-normal">
                Без комиссий агрегаторов до 35%. Вы покупаете товары напрямую по реальной оптовой и розничной стоимости.
              </p>
            </div>
            <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-emerald-500/5 blur-2xl group-hover:bg-emerald-500/15 transition-all" />
          </motion.div>

          {/* Bento Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-sm hover:border-emerald-500/30 hover:shadow-xl transition-all"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 ring-1 ring-teal-500/20 group-hover:scale-110 transition-transform">
              <Sparkles size={24} />
            </div>
            <div className="mt-8">
              <h3 className="text-xl font-bold text-zinc-950 tracking-tight">Умный ИИ-поиск</h3>
              <p className="mt-2 text-sm text-zinc-500 leading-relaxed font-normal">
                Семантический поиск понимает сложные запросы («подарок коллеге», «лучший экран») и сравнивает характеристики.
              </p>
            </div>
            <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-teal-500/5 blur-2xl group-hover:bg-teal-500/15 transition-all" />
          </motion.div>

          {/* Bento Card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-sm hover:border-emerald-500/30 hover:shadow-xl transition-all"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20 group-hover:scale-110 transition-transform">
              <Zap size={24} />
            </div>
            <div className="mt-8">
              <h3 className="text-xl font-bold text-zinc-950 tracking-tight">Синхронизация 1С</h3>
              <p className="mt-2 text-sm text-zinc-500 leading-relaxed font-normal">
                Прямая интеграция со складом. Все товары и остатки отображаются с точностью до единицы в реальном времени.
              </p>
            </div>
            <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-indigo-500/5 blur-2xl group-hover:bg-indigo-500/15 transition-all" />
          </motion.div>

          {/* Bento Card 4 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-sm hover:border-emerald-500/30 hover:shadow-xl transition-all"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-500/20 group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <div className="mt-8">
              <h3 className="text-xl font-bold text-zinc-950 tracking-tight">Защита покупателя</h3>
              <p className="mt-2 text-sm text-zinc-500 leading-relaxed font-normal">
                Официальная гарантия, безопасная оплата через СБП или Долями и простой возврат без скрытых комиссий.
              </p>
            </div>
            <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-amber-500/5 blur-2xl group-hover:bg-amber-500/15 transition-all" />
          </motion.div>
        </div>
      </section>

      {/* 3. Popular Products Showcase with Tabs */}
      <section className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-600">
                Каталог
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 font-display mt-1">
              Популярные товары
            </h2>
            <p className="mt-2 text-sm sm:text-base font-normal text-zinc-500">
              Лучшие предложения с максимальной выгодой от прямого склада
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-2xl self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Все
            </button>
            <button
              onClick={() => setActiveTab('hits')}
              className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'hits'
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Хиты продаж
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'new'
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Новинки
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-80 rounded-3xl bg-zinc-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center rounded-2xl bg-zinc-100 px-8 py-4 text-sm sm:text-base font-bold text-zinc-900 hover:bg-zinc-200 transition-all shadow-2xs hover:-translate-y-0.5"
          >
            <span>Смотреть все товары каталога</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* 4. Interactive AI Shopping Banner */}
      <section className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-zinc-950 p-8 sm:p-14 text-white shadow-2xl">
          {/* Background Auras */}
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-emerald-500/15 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-teal-500/10 blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-400 ring-1 ring-inset ring-emerald-500/20 mb-6">
              <Sparkles size={14} />
              <span>Smart Concierge</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display">
              Не знаете, что выбрать?{' '}
              <br className="hidden sm:block" />
              <span className="text-gradient-emerald">Спросите нашего ИИ-консультанта</span>
            </h2>

            <p className="mt-4 text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
              Искусственный интеллект обучен на всем ассортименте SmartMarket.
              Задайте вопрос своими словами — он сравнит параметры и подберёт идеальный вариант за секунды.
            </p>

            {/* Quick Prompt Pills */}
            <div className="mt-8 flex flex-wrap gap-2.5">
              {[
                'Подбери смартфон до 45 000 ₽ с отличной камерой',
                'Какой подарок выбрать коллеге на праздник?',
                'Что лучше для работы: планшет или ноутбук?',
              ].map((promptText) => (
                <button
                  key={promptText}
                  onClick={() => openAiWithPrompt(promptText)}
                  className="rounded-xl bg-white/10 px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-200 ring-1 ring-white/10 hover:bg-emerald-500/20 hover:text-white hover:ring-emerald-500/40 transition-all text-left"
                >
                  💬 «{promptText}»
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Bento Category Showcase */}
      <section className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-12">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-600">
            Навигация
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 font-display mt-1">
            Категории товаров
          </h2>
          <p className="mt-2 text-sm sm:text-base font-normal text-zinc-500">
            Быстрый переход к разделам прямого каталога
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:grid-cols-4 auto-rows-[220px] sm:auto-rows-[260px]">
          {categories.map((category, index) => {
            const isLarge = index === 0 || index === 3;
            const subCount = category.groups.flatMap((g) => g.items).length;

            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className={isLarge ? 'md:col-span-2' : 'md:col-span-1'}
              >
                <Link
                  href={`/catalog/${category.slug}`}
                  className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-7 transition-all duration-300 hover:border-emerald-500/40 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="rounded-2xl bg-zinc-100 p-3.5 shadow-2xs transition-transform duration-500 group-hover:scale-110 group-hover:bg-emerald-50 group-hover:text-emerald-600 ring-1 ring-zinc-200/50">
                      <ShoppingBag className="h-6 w-6 text-zinc-800 group-hover:text-emerald-600 transition-colors" />
                    </div>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 transition-all duration-300 group-hover:bg-emerald-500 group-hover:text-white group-hover:translate-x-1">
                      <ArrowRight size={14} />
                    </span>
                  </div>

                  <div className="relative z-10 mt-auto">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-950 tracking-tight font-display group-hover:text-emerald-700 transition-colors">
                      {category.name}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm font-semibold text-zinc-400">
                      {subCount} {subCount === 1 ? 'подкатегория' : 'подкатегорий'}
                    </p>
                  </div>

                  {/* Ambient Hover Glow */}
                  <div className="absolute -bottom-10 -right-10 h-36 w-36 rounded-full bg-emerald-500/5 blur-3xl transition-all duration-500 group-hover:bg-emerald-500/20 group-hover:scale-150" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
