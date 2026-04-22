'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Minus, Plus, ChevronRight, Star, MessageCircle, Share2, Heart, MapPin, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import { ImageSlider } from '../../../components/ImageSlider';
import { useCartStore } from '../../../store/cartStore';
import { useFavoritesStore } from '../../../store/favoritesStore';
import { formatPrice } from '../../../lib/utils';
import { ProductCard } from '../../../components/ProductCard';
import { fetchProductBySlug, fetchCatalog } from '../../../lib/1c/catalog';
import { Product } from '../../../types';

const FALLBACK_IMAGE = '/service/image-unavailable.png';


export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();

    fetchProductBySlug(slug, controller.signal)
      .then((p) => {
        if (!p) { setNotFound(true); return; }
        setProduct(p);
      })
      .catch(() => {});

    return () => controller.abort();
  }, [slug]);

  // Загружаем похожие товары когда знаем категорию и категории загружены
  useEffect(() => {
    if (!product) return;
    const controller = new AbortController();
    const catSlug = product.categorySlug || product.category;
    fetchCatalog({ category: catSlug, limit: 5 }, controller.signal)
      .then(({ products }) => setSimilarProducts(products.filter((x) => x.id !== product.id).slice(0, 4)))
      .catch(() => {});
    return () => controller.abort();
  }, [product?.id]);

  const { addItem, updateQuantity, removeItem } = useCartStore();
  const cartItem = useCartStore((state) => state.items.find((item) => item.id === product?.id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const isFavorite = useFavoritesStore((state) => state.favorites.includes(product?.id || ''));

  const [activeImage, setActiveImage] = useState(FALLBACK_IMAGE);

  useEffect(() => {
    const handleResize = () =>
      document.documentElement.classList.toggle('has-floating-bar', window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.documentElement.classList.remove('has-floating-bar');
    };
  }, []);

  useEffect(() => {
    if (product?.imageUrl) setActiveImage(product.imageUrl);
  }, [product?.imageUrl]);

  if (notFound) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-[50vh] flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-zinc-900">Товар не найден</h2>
        <Link href="/catalog" className="mt-4 text-emerald-600 hover:underline font-medium">Вернуться в каталог</Link>
      </motion.div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }
  const mockColors = product.images?.length > 0 ? product.images : [product.imageUrl || FALLBACK_IMAGE];
  const currentIndex = mockColors.indexOf(activeImage);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleFavorite(product.id);
    toast.success(isFavorite ? 'Удалено из избранного' : 'Добавлено в избранное');
  };

  const goTo = (idx: number) => {
    const clamped = Math.max(0, Math.min(idx, mockColors.length - 1));
    setActiveImage(mockColors[clamped]);
  };

  const { catSlug, subSlug, typeSlug } = {
    catSlug: product.categorySlug,
    subSlug: product.subcategorySlug,
    typeSlug: product.typeSlug,
  };

  return (
    <div className="mx-auto max-w-[1536px] px-2 py-2 sm:py-8 sm:px-6 lg:px-8 bg-zinc-50 min-h-screen">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="hidden sm:flex flex-col gap-2 md:gap-4 md:flex-row md:items-center md:justify-between text-sm text-zinc-500 mb-2 sm:mb-8">
        <nav className="flex flex-wrap items-center gap-2 font-medium" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Главная</Link>
          <ChevronRight size={14} className="text-zinc-400" />
          <Link href="/catalog" className="hover:text-emerald-600 transition-colors">Каталог</Link>
          {product.category && catSlug && (
            <>
              <ChevronRight size={14} className="text-zinc-400" />
              <Link href={`/catalog/${catSlug}`} className="hover:text-emerald-600 transition-colors">{product.category}</Link>
            </>
          )}
          {product.subcategory && subSlug && (
            <>
              <ChevronRight size={14} className="text-zinc-400" />
              <Link href={`/catalog/${catSlug}/${subSlug}`} className="hover:text-emerald-600 transition-colors">{product.subcategory}</Link>
            </>
          )}
          {product.type && typeSlug && (
            <>
              <ChevronRight size={14} className="text-zinc-400" />
              <Link href={`/catalog/${catSlug}/${subSlug}/${typeSlug}`} className="hover:text-emerald-600 transition-colors">{product.type}</Link>
            </>
          )}
        </nav>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-10 lg:items-start">
        {/* Gallery */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row gap-4 lg:w-[480px] xl:w-[540px] shrink-0 lg:sticky lg:top-24">
          <div className="hidden sm:flex flex-row sm:flex-col gap-2 w-full sm:w-14 lg:w-16 shrink-0 max-h-[600px] overflow-y-auto scrollbar-hide py-1">
            {mockColors.map((img, idx) => (
              <button key={idx} onClick={() => setActiveImage(img)} className={`relative aspect-[3/4] w-14 sm:w-full shrink-0 overflow-hidden rounded-xl border-2 transition-all ${activeImage === img ? 'border-emerald-500 shadow-md' : 'border-transparent hover:border-zinc-300 opacity-70 hover:opacity-100'} bg-white`}>
                <Image src={img} alt={`${product.name} ${idx + 1}`} fill sizes="64px" className="object-contain" />
              </button>
            ))}
          </div>
          <div className="relative flex-1 aspect-[3/4]">
            <ImageSlider
              images={mockColors}
              activeIndex={currentIndex}
              onIndexChange={goTo}
              alt={product.name}
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:hidden pointer-events-none z-10">
              {mockColors.map((_, idx) => (
                <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${currentIndex === idx ? 'w-6 bg-emerald-500' : 'w-1.5 bg-zinc-300'}`} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex-1 flex flex-col gap-3 sm:gap-8">
          <div>
            <div className="mb-2 lg:hidden">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-zinc-900 tracking-tight">{formatPrice(product.price)}</span>
                {product.oldPrice && <span className="text-lg font-medium text-zinc-400 line-through">{formatPrice(product.oldPrice)}</span>}
              </div>
            </div>
            <div className="flex justify-between items-start gap-4">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 leading-tight tracking-tight">{product.name}</h1>
              <button className="hidden sm:flex items-center gap-1.5 hover:text-emerald-600 transition-colors text-sm text-zinc-500 font-medium shrink-0">
                <Share2 size={18} className="text-zinc-400" />Поделиться
              </button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-500 font-medium">
              <div className="flex items-center text-amber-500 bg-amber-50 px-2 py-1 rounded-md">
                <Star size={16} className="fill-current" /><span className="ml-1.5 font-bold">4.9</span>
              </div>
              <span className="text-zinc-300">•</span>
              <span className="hover:text-emerald-600 cursor-pointer transition-colors border-b border-dashed border-zinc-300 hover:border-emerald-600">9 897 отзывов</span>
              <span className="text-zinc-300">•</span>
              <span className="flex items-center gap-1.5 hover:text-emerald-600 cursor-pointer transition-colors border-b border-dashed border-zinc-300 hover:border-emerald-600">
                <MessageCircle size={16} />94 вопроса
              </span>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm ring-1 ring-zinc-200/50">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h2 className="text-xl font-extrabold text-zinc-900">О товаре</h2>
              <button onClick={() => document.getElementById('description')?.scrollIntoView({ behavior: 'smooth' })} className="text-xs text-zinc-700 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-xl flex items-center font-bold transition-colors">
                Перейти к описанию<ChevronRight size={14} className="ml-0.5" />
              </button>
            </div>
            <div className="flex flex-col text-sm">
              {product.brand && (
                <div className="flex py-2 border-b border-zinc-100">
                  <span className="w-1/2 text-zinc-500 font-medium pr-4">Бренд</span>
                  <Link href={`/catalog/${[catSlug, subSlug, typeSlug].filter(Boolean).join('/')}?brand=${product.brandSlug}`} className="w-1/2 text-emerald-600 font-medium hover:underline">{product.brand}</Link>
                </div>
              )}
              {product.subcategory && (
                <div className="flex py-2 border-b border-zinc-100">
                  <span className="w-1/2 text-zinc-500 font-medium pr-4">Категория</span>
                  {catSlug && subSlug
                    ? <Link href={`/catalog/${catSlug}/${subSlug}`} className="w-1/2 text-emerald-600 font-medium hover:underline">{product.subcategory}</Link>
                    : <span className="w-1/2 text-zinc-900 font-medium">{product.subcategory}</span>
                  }
                </div>
              )}
              {product.type && (
                <div className="flex py-2 border-b border-zinc-100">
                  <span className="w-1/2 text-zinc-500 font-medium pr-4">Тип</span>
                  {catSlug && subSlug && typeSlug
                    ? <Link href={`/catalog/${catSlug}/${subSlug}/${typeSlug}`} className="w-1/2 text-emerald-600 font-medium hover:underline">{product.type}</Link>
                    : <span className="w-1/2 text-zinc-900 font-medium">{product.type}</span>
                  }
                </div>
              )}
              {Object.entries(product.characteristics).map(([key, value]) => (
                <div key={key} className="flex py-2 border-b border-zinc-100 last:border-0">
                  <span className="w-1/2 text-zinc-500 font-medium pr-4">{key}</span>
                  <span className="w-1/2 text-zinc-900 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Buy block */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:w-[340px] xl:w-[380px] shrink-0">
          <div className="sticky top-24 flex flex-col gap-6">
            <div className="hidden lg:block bg-white rounded-3xl shadow-lg shadow-zinc-200/40 p-6 ring-1 ring-zinc-200/50">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-extrabold text-zinc-900 tracking-tight">{formatPrice(product.price)}</span>
                {product.oldPrice && <span className="text-lg font-medium text-zinc-400 line-through">{formatPrice(product.oldPrice)}</span>}
              </div>
              <div className="mt-8 flex items-center gap-3">
                {cartItem ? (
                  <>
                    <button onClick={() => router.push('/cart')} className="flex-1 bg-emerald-500 text-white rounded-2xl h-14 flex items-center justify-center transition-all hover:bg-emerald-600 hover:shadow-md hover:-translate-y-0.5">
                      <span className="font-bold text-base">В корзине</span>
                    </button>
                    <div className="flex items-center bg-zinc-100 rounded-2xl h-14 px-1.5 ring-1 ring-zinc-200/50">
                      <button onClick={() => { if (cartItem.quantity === 1) removeItem(product.id); else updateQuantity(product.id, cartItem.quantity - 1); }} className="w-10 h-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors"><Minus size={18} /></button>
                      <span className="w-8 text-center font-bold text-zinc-900">{cartItem.quantity}</span>
                      <button onClick={() => updateQuantity(product.id, cartItem.quantity + 1)} className="w-10 h-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors"><Plus size={18} /></button>
                    </div>
                  </>
                ) : (
                  <button onClick={() => { addItem(product, 1); if (window.innerWidth >= 1024) toast.success('Товар добавлен в корзину'); }} className="flex-1 bg-emerald-500 text-white rounded-2xl h-14 font-bold text-base transition-all hover:bg-emerald-600 hover:shadow-md hover:-translate-y-0.5">
                    В корзину
                  </button>
                )}
                <button onClick={handleToggleFavorite} className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all shrink-0 ${isFavorite ? 'bg-rose-50 text-rose-500 ring-1 ring-rose-200' : 'bg-zinc-50 text-zinc-400 hover:bg-zinc-100 hover:text-rose-400 ring-1 ring-zinc-200/50'}`}>
                  <Heart size={24} className={isFavorite ? 'fill-current' : ''} />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm ring-1 ring-zinc-200/50 p-6 space-y-5">
              <h3 className="font-bold text-zinc-900 text-lg">Доставка и возврат</h3>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center shrink-0"><MapPin size={20} className="text-zinc-500" /></div>
                <div><p className="text-sm font-bold text-zinc-900">Москва</p><p className="text-xs font-medium text-zinc-500 mt-0.5">Со склада MarketMVP, Московская Область</p></div>
              </div>
              <div className="flex justify-between items-center gap-4 pt-4 border-t border-zinc-100">
                <div><p className="text-sm font-bold text-zinc-900">Курьером</p><p className="text-xs font-medium text-emerald-600 mt-0.5">Завтра</p></div>
                <span className="text-xs font-bold text-zinc-900 bg-zinc-100 px-3 py-1.5 rounded-lg">149 ₽</span>
              </div>
              <div className="flex justify-between items-center gap-4 pt-4 border-t border-zinc-100">
                <div><p className="text-sm font-bold text-zinc-900">Пункты выдачи</p><p className="text-xs font-medium text-emerald-600 mt-0.5">Завтра</p></div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg">Бесплатно</span>
              </div>
              <div className="flex gap-4 pt-4 border-t border-zinc-100">
                <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center shrink-0"><RotateCcw size={20} className="text-zinc-500" /></div>
                <div className="flex items-center"><p className="text-sm font-bold text-zinc-900">Можно вернуть в течение 15 дней</p></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-6 sm:mt-12 max-w-[1000px] flex flex-col gap-6 sm:gap-8">
        <div id="description" className="bg-white p-5 sm:p-10 rounded-3xl shadow-sm ring-1 ring-zinc-200/50">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight mb-4 sm:mb-8">Описание</h2>
          <div className="prose prose-zinc max-w-none text-zinc-600 font-medium leading-relaxed">
            <p>{product.description}</p>
          </div>
        </div>
      </motion.div>

      {similarProducts.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-10 sm:mt-20 mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">Похожие товары</h2>
            <Link href={`/catalog/${product.categorySlug}`} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-wider">Смотреть все</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {similarProducts.map((p) => <ProductCard key={p.id} product={p} aspectRatio="aspect-[6/5]" />)}
          </div>
        </motion.section>
      )}

      {/* Mobile floating bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 border-t border-zinc-200 p-3 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] backdrop-blur-lg">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          {cartItem ? (
            <div className="flex flex-1 items-center bg-zinc-100 rounded-2xl h-12 px-1.5 ring-1 ring-zinc-200/50">
              <button onClick={() => { if (cartItem.quantity === 1) removeItem(product.id); else updateQuantity(product.id, cartItem.quantity - 1); }} className="w-10 h-full flex items-center justify-center text-zinc-500"><Minus size={18} /></button>
              <span className="flex-1 text-center font-bold text-zinc-900 text-sm">{cartItem.quantity} шт</span>
              <button onClick={() => updateQuantity(product.id, cartItem.quantity + 1)} className="w-10 h-full flex items-center justify-center text-zinc-500"><Plus size={18} /></button>
            </div>
          ) : (
            <button onClick={() => addItem(product, 1)} className="flex-1 bg-emerald-500 text-white rounded-2xl h-12 font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform">
              В корзину
            </button>
          )}
          <button onClick={handleToggleFavorite} className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all shrink-0 ${isFavorite ? 'bg-rose-50 text-rose-500 ring-1 ring-rose-200' : 'bg-zinc-50 text-zinc-400 ring-1 ring-zinc-200/50'}`}>
            <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
          </button>
          <button className="flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-50 text-zinc-400 ring-1 ring-zinc-200/50 active:scale-95 transition-transform">
            <Share2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
