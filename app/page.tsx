'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ShoppingBag,
  Search,
  ShieldCheck,
  Zap,
  Bot,
  TrendingUp,
  Percent,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Truck,
  CheckCircle2,
  Smartphone,
  Laptop,
  Headphones,
  Tablet,
  Home,
  Warehouse,
  Star,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { useProductsStore } from '../store/productsStore';
import { fetchCatalog } from '../lib/1c/catalog';
import { formatPrice } from '../lib/utils';
import type { Product } from '../types';

// Реалистичные товары каталога для демонстрационной витрины (полное соответствие номенклатуре 1С)
const FALLBACK_PROMO_PRODUCTS: Product[] = [
  {
    id: 'cd077ea2-3370-11f1-8d65-4c2338935cb2',
    slug: 'apple-smartfon-iphone-15-simesim-128-gb-siniy',
    name: 'Apple Смартфон iPhone 15 SIM+eSIM 128 ГБ, синий',
    price: 52500,
    oldPrice: 58990,
    category: 'Электроника',
    categorySlug: 'elektronika',
    subcategory: 'Смартфоны',
    subcategorySlug: 'smartfony',
    type: 'Смартфоны',
    typeSlug: 'smartfony',
    brand: 'Apple',
    brandSlug: 'apple',
    imageUrl: '/api/1c/catalog/cd077ea2-3370-11f1-8d65-4c2338935cb2/images/04119973-aa1a-11f1-8db7-4c2338935cb1',
    images: ['/api/1c/catalog/cd077ea2-3370-11f1-8d65-4c2338935cb2/images/04119973-aa1a-11f1-8db7-4c2338935cb1'],
    inStock: 3,
    description: 'Смартфон Apple iPhone 15 с Dynamic Island, передовой камерой 48 Мп и портом USB-C.',
    shortDescription: 'Dynamic Island, 48 Мп, USB-C, Super Retina XDR 6.1"',
    characteristics: { Память: '128 ГБ', Цвет: 'Синий', SIM: 'SIM + eSIM' },
    sku: '04119973-aa1a-11f1-8db7-4c2338935cb1',
  },
  {
    id: 'a1d96a75-4bd5-11f1-8d84-4c2338935cb2',
    slug: 'noutbuk-apple-macbook-air-13-m4-16-256-gb-seryy-kosmos',
    name: 'Ноутбук Apple MacBook Air 13 M4 16/256 ГБ серый космос',
    price: 125000,
    oldPrice: 139990,
    category: 'Электроника',
    categorySlug: 'elektronika',
    subcategory: 'Ноутбуки, планшеты и электронные книги',
    subcategorySlug: 'noutbuki-planshety-i-elektronnye-knigi',
    type: 'Ноутбуки',
    typeSlug: 'noutbuki',
    brand: 'Apple',
    brandSlug: 'apple',
    imageUrl: '/api/1c/catalog/a1d96a75-4bd5-11f1-8d84-4c2338935cb2/images/04119974-aa1a-11f1-8db7-4c2338935cb1',
    images: ['/api/1c/catalog/a1d96a75-4bd5-11f1-8d84-4c2338935cb2/images/04119974-aa1a-11f1-8db7-4c2338935cb1'],
    inStock: 1,
    description: 'Сверхтонкий и быстрый ноутбук на новом процессоре Apple M4 с автономностью до 18 часов.',
    shortDescription: 'Чип Apple M4, 16 ГБ RAM, 256 ГБ SSD, 13.6" Liquid Retina',
    characteristics: { Процессор: 'Apple M4', RAM: '16 ГБ', SSD: '256 ГБ' },
    sku: 'APL-MBA13-M4-256-GRY',
  },
  {
    id: 'b025375d-318b-11f1-8d64-4c2338935cb2',
    slug: 'smartfon-xiaomi-14t-global-12-256-gb-chernyy',
    name: 'Смартфон Xiaomi 14T Global 12/256 ГБ, черный',
    price: 32000,
    oldPrice: 38990,
    category: 'Электроника',
    categorySlug: 'elektronika',
    subcategory: 'Смартфоны',
    subcategorySlug: 'smartfony',
    type: 'Смартфоны',
    typeSlug: 'smartfony',
    brand: 'Xiaomi',
    brandSlug: 'xiaomi',
    imageUrl: '/service/image-unavailable.svg',
    images: ['/service/image-unavailable.svg'],
    inStock: 2,
    description: 'Флагманский дисплей AMOLED 144 Гц с поддержкой HDR10+, оптика Leica и процессор MediaTek Dimensity 8300-Ultra.',
    shortDescription: 'AMOLED 144 Гц, Leica, Dimensity 8300-Ultra, быстрая зарядка 67 Вт',
    characteristics: { Память: '256 ГБ', RAM: '12 ГБ', Цвет: 'Черный' },
    sku: 'b025375d-318b-11f1-8d64-4c2338935cb2',
  },
];

interface HeroSlide {
  id: number;
  productId: string;
  tag: string;
  tagIcon: typeof Flame;
  title: string;
  model: string;
  subtitle: string;
  price: number;
  oldPrice: number;
  discountLabel: string;
  specs: string[];
  imageUrl: string;
  imageAlt: string;
  rating: string;
  reviewCount: string;
  stockStatus: string;
  ctaPrimary: { text: string; href: string };
  ctaSecondary: { text: string; href: string };
  gradient: string;
  accentGlow: string;
  badgeColor: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    productId: 'cd077ea2-3370-11f1-8d65-4c2338935cb2',
    tag: 'Хит продаж • Apple',
    tagIcon: Flame,
    title: 'Смартфон Apple',
    model: 'iPhone 15 128 ГБ',
    subtitle: 'Dynamic Island, передовая основная камера 48 Мп и надежный корпус с матовым стеклом.',
    price: 52500,
    oldPrice: 58990,
    discountLabel: 'Выгода 6 490 ₽',
    specs: ['Камера 48 Мп', 'Dynamic Island', 'Разъем USB-C', 'Гарантия 1 год'],
    imageUrl: '/api/1c/catalog/cd077ea2-3370-11f1-8d65-4c2338935cb2/images/04119973-aa1a-11f1-8db7-4c2338935cb1',
    imageAlt: 'Apple Смартфон iPhone 15 SIM+eSIM 128 ГБ, синий',
    rating: '4.9',
    reviewCount: '128',
    stockStatus: 'В наличии: 3 шт.',
    ctaPrimary: { text: 'Купить', href: '/product/apple-smartfon-iphone-15-simesim-128-gb-siniy' },
    ctaSecondary: { text: 'Все смартфоны', href: '/catalog/elektronika' },
    gradient: 'from-[#f4f2ee] via-[#f7f6f2] to-white',
    accentGlow: 'bg-amber-500/10',
    badgeColor: 'bg-zinc-950 text-white',
  },
  {
    id: 2,
    productId: 'a1d96a75-4bd5-11f1-8d84-4c2338935cb2',
    tag: 'Новинка • Ноутбуки',
    tagIcon: Zap,
    title: 'Ноутбук Apple',
    model: 'MacBook Air 13 M4',
    subtitle: 'Флагманская скорость процессора Apple M4, дисплей Liquid Retina и до 18 часов автономной работы.',
    price: 125000,
    oldPrice: 139990,
    discountLabel: 'Выгода 14 990 ₽',
    specs: ['Чип Apple M4', '16 ГБ RAM / 256 ГБ SSD', 'Liquid Retina 13.6"', 'До 18 ч работы'],
    imageUrl: '/api/1c/catalog/a1d96a75-4bd5-11f1-8d84-4c2338935cb2/images/04119974-aa1a-11f1-8db7-4c2338935cb1',
    imageAlt: 'Ноутбук Apple MacBook Air 13 M4 серый космос',
    rating: '5.0',
    reviewCount: '42',
    stockStatus: 'В наличии: 1 шт.',
    ctaPrimary: { text: 'Купить', href: '/product/noutbuk-apple-macbook-air-13-m4-16-256-gb-seryy-kosmos' },
    ctaSecondary: { text: 'Все ноутбуки', href: '/catalog/elektronika' },
    gradient: 'from-[#f0f4f8] via-[#f4f7fb] to-white',
    accentGlow: 'bg-sky-500/10',
    badgeColor: 'bg-sky-700 text-white',
  },
];

const QUICK_CATEGORIES = [
  { name: 'Скидки недели', href: '/catalog', icon: Flame, isHighlight: true, badge: '-40%' },
  { name: 'Смартфоны', href: '/catalog/elektronika', icon: Smartphone },
  { name: 'Ноутбуки', href: '/catalog/elektronika', icon: Laptop },
  { name: 'Наушники и аудио', href: '/catalog/elektronika', icon: Headphones },
  { name: 'Планшеты', href: '/catalog/elektronika', icon: Tablet },
  { name: 'Смарт-часы', href: '/catalog/elektronika', icon: Clock },
  { name: 'Телевизоры', href: '/catalog/elektronika', icon: Home },
];

export default function HomePage() {
  const { categories } = useProductsStore();
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'hits' | 'new'>('all');
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Загрузка каталога с автоматическим fallback
  useEffect(() => {
    fetchCatalog({ page: 1, limit: 20 })
      .then(({ products }) => {
        if (products.length > 0) {
          setPopularProducts(products);
        } else {
          setPopularProducts(FALLBACK_PROMO_PRODUCTS);
        }
      })
      .catch(() => {
        setPopularProducts(FALLBACK_PROMO_PRODUCTS);
      })
      .finally(() => setLoading(false));
  }, []);

  // Автопрокрутка слайдера промо-баннеров (5.5 сек)
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isHovered]);

  // Актуализируем данные слайдов из 1С при наличии каталога
  const activeSlides = HERO_SLIDES.map((slide) => {
    const liveProd = popularProducts.find(
      (p) => p.id === slide.productId || p.slug === slide.ctaPrimary.href.replace('/product/', '')
    );
    if (!liveProd) return slide;
    return {
      ...slide,
      price: liveProd.price || slide.price,
      oldPrice: liveProd.oldPrice || slide.oldPrice,
      stockStatus: liveProd.inStock > 0 ? `В наличии: ${liveProd.inStock} шт.` : 'Под заказ',
      imageUrl:
        liveProd.imageUrl && !liveProd.imageUrl.includes('image-unavailable.svg')
          ? liveProd.imageUrl
          : slide.imageUrl,
    };
  });

  const currentHeroSlide = activeSlides[activeSlide] || activeSlides[0];
  const filteredProducts = popularProducts.filter((p, index) => {
    if (activeTab === 'hits') return index % 2 === 0;
    if (activeTab === 'new') return index % 2 !== 0;
    return true;
  });

  return (
    <div className="flex flex-col gap-14 sm:gap-20 pb-20 overflow-hidden bg-[#fbfbfd]">
      {/* 1. Премиальный коммерческий Hero-блок (Слайдер + Витрина акций + Трастовая полоса) */}
      <section className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* Панель быстрых категорий (Quick Category Bar с векторными иконками) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 sm:mb-6 scrollbar-hide text-xs sm:text-sm font-semibold">
          {QUICK_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                href={cat.href}
                className={`group inline-flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full transition-all border ${
                  cat.isHighlight
                    ? 'bg-rose-50 text-rose-700 border-rose-200/80 font-bold hover:bg-rose-100 shadow-2xs'
                    : 'bg-white text-zinc-700 border-zinc-200/80 hover:border-emerald-500/40 hover:text-emerald-700 hover:shadow-2xs'
                }`}
              >
                <Icon
                  size={15}
                  className={cat.isHighlight ? 'text-rose-500' : 'text-zinc-500 group-hover:text-emerald-600 transition-colors'}
                />
                <span>{cat.name}</span>
                {cat.badge && (
                  <span className="rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-black text-white leading-none">
                    {cat.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Флагманский промо-слайдер */}
        <div
          className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm flex flex-col justify-between min-h-[380px] sm:min-h-[420px] lg:min-h-[440px] xl:min-h-[460px] w-full"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentHeroSlide.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className={`absolute inset-0 flex flex-col justify-between bg-gradient-to-br ${currentHeroSlide.gradient}`}
            >
              {/* Рассеянные световые ореолы */}
              <div className={`absolute top-0 right-1/4 h-72 w-72 lg:h-96 lg:w-96 rounded-full ${currentHeroSlide.accentGlow} blur-3xl pointer-events-none`} />
              <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-zinc-400/5 blur-3xl pointer-events-none" />

              {/* Двухколоночный контент слайда */}
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10 items-center p-5 sm:p-8 lg:p-10 flex-1">
                {/* Левая сторона: информация об устройстве, цены и кнопки */}
                <div className="md:col-span-7 flex flex-col justify-center">
                  {/* Бейдж акции и гарантия */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide shadow-2xs ${currentHeroSlide.badgeColor}`}>
                      <currentHeroSlide.tagIcon size={13} className="text-amber-400" />
                      <span>{currentHeroSlide.tag}</span>
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-zinc-600 border border-zinc-200/80 shadow-2xs backdrop-blur-xs">
                      <CheckCircle2 size={13} className="text-emerald-500" />
                      Официальная поставка
                    </span>
                  </div>

                  {/* Заголовок и модель */}
                  <div className="mt-3">
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-600">
                      {currentHeroSlide.title}
                    </span>
                    <h1 className="mt-0.5 font-display text-2xl sm:text-3xl lg:text-[34px] xl:text-[40px] font-black tracking-tight text-zinc-950 leading-[1.1]">
                      {currentHeroSlide.model}
                    </h1>
                    <p className="mt-2 text-xs sm:text-sm lg:text-base text-zinc-600 font-normal leading-relaxed line-clamp-2 max-w-xl">
                      {currentHeroSlide.subtitle}
                    </p>
                  </div>

                  {/* Блок цен и выгоды */}
                  <div className="mt-3.5 flex flex-wrap items-baseline gap-2.5">
                    <span className="font-display text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-zinc-950">
                      {formatPrice(currentHeroSlide.price)}
                    </span>
                    {currentHeroSlide.oldPrice > currentHeroSlide.price && (
                      <>
                        <span className="text-sm sm:text-base lg:text-lg font-semibold text-zinc-400 line-through">
                          {formatPrice(currentHeroSlide.oldPrice)}
                        </span>
                        <span className="inline-flex items-center rounded-lg bg-rose-50 px-2 py-0.5 text-xs font-black text-rose-600 border border-rose-200/80">
                          {currentHeroSlide.discountLabel}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Микро-чипы характеристик */}
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {currentHeroSlide.specs.map((spec) => (
                      <span
                        key={spec}
                        className="inline-flex items-center rounded-lg bg-white/95 px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-zinc-700 border border-zinc-200/70 shadow-2xs"
                      >
                        ✓ {spec}
                      </span>
                    ))}
                  </div>

                  {/* Кнопки призыва к действию (CTA) */}
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Link
                      href={currentHeroSlide.ctaPrimary.href}
                      className="shimmer-btn inline-flex items-center justify-center rounded-2xl bg-zinc-950 px-6 sm:px-8 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-zinc-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <ShoppingBag size={16} className="mr-2 text-emerald-400" />
                      <span>{currentHeroSlide.ctaPrimary.text}</span>
                      <ArrowRight size={15} className="ml-2" />
                    </Link>

                    <Link
                      href={currentHeroSlide.ctaSecondary.href}
                      className="inline-flex items-center justify-center rounded-2xl bg-white/95 px-5 sm:px-6 py-3.5 text-xs sm:text-sm font-bold text-zinc-800 border border-zinc-200/80 hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-2xs"
                    >
                      <span>{currentHeroSlide.ctaSecondary.text}</span>
                    </Link>
                  </div>
                </div>

                {/* Правая сторона: рендер устройства с объемной тенью и аккуратными бейджами */}
                <div className="md:col-span-5 relative flex items-center justify-center py-4 md:py-0">
                  <div className="relative h-60 w-60 sm:h-72 sm:w-72 md:h-72 md:w-72 lg:h-84 lg:w-84 xl:h-96 xl:w-96 transition-transform duration-500 hover:scale-105">
                    <Image
                      src={currentHeroSlide.imageUrl}
                      alt={currentHeroSlide.imageAlt}
                      fill
                      priority
                      sizes="(max-width: 768px) 280px, (max-width: 1200px) 380px, 450px"
                      className="object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.12)] rounded-2xl"
                    />

                    {/* Плавающий бейдж рейтинга (привязан к изображению) */}
                    <div className="absolute top-1 right-1 z-20 flex items-center gap-1.5 rounded-xl bg-white/95 px-2.5 py-1 text-xs font-bold text-zinc-800 shadow-md border border-zinc-200/80 backdrop-blur-md">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <span>{currentHeroSlide.rating}</span>
                      <span className="text-zinc-400 font-normal text-[10px]">({currentHeroSlide.reviewCount})</span>
                    </div>

                    {/* Плавающий бейдж наличия (привязан к изображению) */}
                    <div className="absolute bottom-1 left-1 z-20 flex items-center gap-1.5 rounded-xl bg-white/95 px-2.5 py-1 text-xs font-semibold text-zinc-800 shadow-md border border-zinc-200/80 backdrop-blur-md">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[11px] font-bold text-zinc-700">{currentHeroSlide.stockStatus}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Нижняя полоса управления слайдером */}
              <div className="relative z-10 flex items-center justify-between border-t border-zinc-200/60 px-5 sm:px-8 py-2.5 sm:py-3 bg-white/60 backdrop-blur-xs">
                {/* Индикаторы слайдов */}
                <div className="flex items-center gap-2">
                  {activeSlides.map((slide, idx) => (
                    <button
                      key={slide.id}
                      onClick={() => setActiveSlide(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        activeSlide === idx
                          ? 'w-7 bg-zinc-950'
                          : 'w-2 bg-zinc-300 hover:bg-zinc-400'
                      }`}
                      aria-label={`Перейти к слайду ${idx + 1}`}
                    />
                  ))}
                </div>

                {/* Кнопки переключения */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      setActiveSlide((prev) =>
                        prev === 0 ? activeSlides.length - 1 : prev - 1
                      )
                    }
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-zinc-700 shadow-xs border border-zinc-200 hover:text-emerald-600 transition-all active:scale-95 cursor-pointer"
                    aria-label="Предыдущий слайд"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    onClick={() =>
                      setActiveSlide((prev) => (prev + 1) % activeSlides.length)
                    }
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-zinc-700 shadow-xs border border-zinc-200 hover:text-emerald-600 transition-all active:scale-95 cursor-pointer"
                    aria-label="Следующий слайд"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Полоса гарантий и сервиса магазина (Trust Strip) */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white border border-zinc-200/80 p-4 shadow-2xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-zinc-950">Официальная гарантия</h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">1 год на всю технику и гаджеты</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white border border-zinc-200/80 p-4 shadow-2xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <Truck size={20} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-zinc-950">Доставка за 2 часа</h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">Курьером или самовывоз со склада</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white border border-zinc-200/80 p-4 shadow-2xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Warehouse size={20} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-zinc-950">Товары в наличии</h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">Быстрая отгрузка со склада</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white border border-zinc-200/80 p-4 shadow-2xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <RotateCcw size={20} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-zinc-950">Простой возврат</h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">14 дней без лишних вопросов</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Каталог: Популярные товары с вкладками */}
      <section className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-600">
                Каталог
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 font-display mt-1">
              Популярные товары
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-zinc-500">
              Оригинальная техника с официальной гарантией и быстрой доставкой
            </p>
          </div>

          {/* Табы фильтрации */}
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
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-80 rounded-3xl bg-zinc-100 animate-pulse border border-zinc-200/50" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center rounded-2xl bg-zinc-100 px-8 py-4 text-sm sm:text-base font-bold text-zinc-900 hover:bg-zinc-200 transition-all shadow-2xs hover:-translate-y-0.5"
          >
            <span>Смотреть все товары каталога</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* 6. Категории товаров (Bento Category Showcase) */}
      <section className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-600">
            Навигация
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 font-display mt-1">
            Категории товаров
          </h2>
          <p className="mt-1 text-xs sm:text-sm font-normal text-zinc-500">
            Быстрый переход к разделам каталога
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 auto-rows-[200px] sm:auto-rows-[240px]">
          {categories.map((category, index) => {
            const isLarge = index === 0 || index === 3;
            const subCount = category.groups.flatMap((g) => g.items).length;

            return (
              <div
                key={category.name}
                className={isLarge ? 'md:col-span-2' : 'md:col-span-1'}
              >
                <Link
                  href={`/catalog/${category.slug}`}
                  className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-7 transition-all duration-300 hover:border-emerald-500/40 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="rounded-2xl bg-zinc-100 p-3 shadow-2xs transition-transform duration-300 group-hover:scale-105 group-hover:bg-emerald-50 group-hover:text-emerald-600 ring-1 ring-zinc-200/50">
                      <ShoppingBag className="h-6 w-6 text-zinc-800 group-hover:text-emerald-600 transition-colors" />
                    </div>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 transition-all duration-300 group-hover:bg-emerald-500 group-hover:text-white group-hover:translate-x-0.5">
                      <ArrowRight size={14} />
                    </span>
                  </div>

                  <div className="relative z-10 mt-auto">
                    <h3 className="text-lg sm:text-2xl font-extrabold text-zinc-950 tracking-tight font-display group-hover:text-emerald-700 transition-colors">
                      {category.name}
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-zinc-400">
                      {subCount} {subCount === 1 ? 'подкатегория' : 'подкатегорий'}
                    </p>
                  </div>

                  <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-emerald-500/5 blur-2xl transition-all duration-500 group-hover:bg-emerald-500/15 group-hover:scale-125" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
