'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart, Minus, Plus, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { useCartStore } from '../store/cartStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { formatPrice } from '../lib/utils';
import { getProductImage, getProductFallbackImage } from '../lib/productMedia';
import React, { useState, useEffect } from 'react';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  aspectRatio?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewMode = 'grid',
  aspectRatio = 'aspect-[4/5]',
}) => {
  const [imgSrc, setImgSrc] = useState(() =>
    getProductImage(product.slug || product.id, product.name, product.imageUrl)
  );

  useEffect(() => {
    setImgSrc(getProductImage(product.slug || product.id, product.name, product.imageUrl));
  }, [product.imageUrl, product.slug, product.id, product.name]);

  const { addItem, updateQuantity, removeItem } = useCartStore();
  const cartItem = useCartStore((state) => state.items.find((item) => item.id === product.id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const isFavorite = useFavoritesStore((state) => state.favorites.includes(product.id));

  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if ((product.inStock ?? 0) === 0) return;
    addItem(product);
    if (window.innerWidth >= 1024) toast.success('Товар добавлен в корзину');
  };

  const handleUpdateQuantity = (e: React.MouseEvent, newQuantity: number) => {
    e.preventDefault();
    if (newQuantity === 0) {
      removeItem(product.id);
      if (window.innerWidth >= 1024) toast.success('Товар удален из корзины');
    } else {
      updateQuantity(product.id, newQuantity);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleFavorite(product.id);
    toast.success(isFavorite ? 'Удалено из избранного' : 'Добавлено в избранное');
  };

  return (
    <Link
      href={`/product/${product.slug}`}
      className={`group relative flex overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-200/80 bg-white p-3 sm:p-4 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_16px_32px_-10px_rgba(0,0,0,0.08),0_0_20px_-5px_rgba(16,185,129,0.12)] hover:-translate-y-1 ${
        viewMode === 'list'
          ? 'flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-center'
          : 'flex-col'
      }`}
    >
      {/* Image Container with Badges */}
      <div
        className={`relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-b from-zinc-50 to-zinc-100/60 shrink-0 ${
          viewMode === 'list' ? `w-full sm:w-44 ${aspectRatio} sm:aspect-square` : aspectRatio
        }`}
      >
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-contain p-2 sm:p-3 transition-transform duration-700 ease-out group-hover:scale-108"
          onError={() => setImgSrc(getProductFallbackImage(product.slug || product.id, product.name))}
        />

        {/* Discount Badge */}
        {discountPercent ? (
          <div className="absolute left-2.5 top-2.5 flex items-center rounded-full bg-zinc-950/85 px-2 py-0.5 text-[10px] font-extrabold text-emerald-400 backdrop-blur-md ring-1 ring-white/10 shadow-sm">
            -{discountPercent}%
          </div>
        ) : null}

        {/* Favorite Button */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleToggleFavorite}
          className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 ${
            isFavorite
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white/85 text-zinc-400 hover:bg-white hover:text-rose-500 hover:shadow-sm ring-1 ring-black/5'
          }`}
          aria-label="В избранное"
        >
          <Heart size={15} className={isFavorite ? 'fill-current' : ''} />
        </motion.button>
      </div>

      {viewMode === 'list' ? (
        <div className="flex flex-1 flex-col sm:flex-row gap-4 justify-between h-full py-1">
          <div className="flex flex-col flex-1 justify-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700/80">
              {product.category}
            </span>
            <h3 className="mt-1 font-semibold leading-snug text-zinc-950 group-hover:text-emerald-600 transition-colors text-base sm:text-lg line-clamp-2">
              {product.name}
            </h3>
            <p className="mt-2 text-sm text-zinc-500 line-clamp-2 hidden sm:block font-normal leading-relaxed">
              {product.shortDescription}
            </p>
          </div>

          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 sm:w-52 shrink-0 border-t sm:border-t-0 sm:border-l border-zinc-100 pt-3 sm:pt-0 sm:pl-6">
            <div className="flex flex-col items-start sm:items-end">
              {product.oldPrice && (
                <span className="text-xs font-medium text-zinc-400 line-through mb-0.5 tabular-nums">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
              <span className="text-lg sm:text-2xl font-extrabold tracking-tight text-zinc-950 tabular-nums">
                {formatPrice(product.price)}
              </span>
            </div>

            {cartItem ? (
              <div className="flex h-10 items-center rounded-full border border-emerald-500/80 bg-emerald-50/70 shadow-2xs">
                <button
                  onClick={(e) => handleUpdateQuantity(e, cartItem.quantity - 1)}
                  className="flex h-full w-10 items-center justify-center text-emerald-700 hover:bg-emerald-100/70 rounded-l-full transition-colors active:scale-90"
                  aria-label="Уменьшить"
                >
                  <Minus size={15} />
                </button>
                <span className="flex w-8 items-center justify-center text-sm font-extrabold text-emerald-950 tabular-nums">
                  {cartItem.quantity}
                </span>
                <button
                  onClick={(e) => handleUpdateQuantity(e, cartItem.quantity + 1)}
                  disabled={(product.inStock ?? 0) > 0 && cartItem.quantity >= product.inStock}
                  className="flex h-full w-10 items-center justify-center text-emerald-700 hover:bg-emerald-100/70 rounded-r-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                  aria-label="Увеличить"
                >
                  <Plus size={15} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={(product.inStock ?? 0) === 0}
                className="shimmer-btn flex h-10 px-5 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white transition-all hover:bg-emerald-600 hover:shadow-md gap-2 font-bold text-xs sm:text-sm w-full sm:w-auto disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="В корзину"
              >
                <ShoppingCart size={15} />
                <span>{product.inStock === 0 ? 'Нет в наличии' : 'В корзину'}</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-3 sm:mt-4 flex flex-1 flex-col">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-700/80">
            {product.category}
          </span>
          <h3 className="mt-1 line-clamp-2 text-xs sm:text-sm font-semibold leading-snug text-zinc-900 group-hover:text-emerald-600 transition-colors">
            {product.name}
          </h3>

          <div className="mt-auto pt-3 sm:pt-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div className="flex flex-col">
                {product.oldPrice && (
                  <span className="text-[10px] sm:text-xs font-medium text-zinc-400 line-through mb-0.5 tabular-nums">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-zinc-950 tabular-nums">
                  {formatPrice(product.price)}
                </span>
              </div>

              {cartItem ? (
                <div className="flex h-8 sm:h-9 items-center rounded-full border border-emerald-500/80 bg-emerald-50/70 shadow-2xs w-full sm:w-auto justify-between sm:justify-start">
                  <button
                    onClick={(e) => handleUpdateQuantity(e, cartItem.quantity - 1)}
                    className="flex h-full w-8 items-center justify-center text-emerald-700 hover:bg-emerald-100/70 rounded-l-full transition-colors active:scale-90"
                    aria-label="Уменьшить"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="flex w-6 items-center justify-center text-xs font-extrabold text-emerald-950 tabular-nums">
                    {cartItem.quantity}
                  </span>
                  <button
                    onClick={(e) => handleUpdateQuantity(e, cartItem.quantity + 1)}
                    disabled={(product.inStock ?? 0) > 0 && cartItem.quantity >= product.inStock}
                    className="flex h-full w-8 items-center justify-center text-emerald-700 hover:bg-emerald-100/70 rounded-r-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                    aria-label="Увеличить"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={(product.inStock ?? 0) === 0}
                  className="shimmer-btn flex h-8 sm:h-9 w-full sm:w-9 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white transition-all hover:bg-emerald-600 hover:shadow-md gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="В корзину"
                >
                  <ShoppingCart size={14} />
                  <span className="sm:hidden text-xs font-bold">
                    {product.inStock === 0 ? 'Нет' : 'Купить'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Link>
  );
};
