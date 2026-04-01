'use client';

import Link from 'next/link';
import { ShoppingCart, Heart, Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Product } from '../types';
import { useCartStore } from '../store/cartStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { formatPrice } from '../lib/utils';

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
  const { items, addItem, updateQuantity, removeItem } = useCartStore();
  const cartItem = items.find((item) => item.id === product.id);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const isFavorite = useFavoritesStore((state) => state.favorites.includes(product.id));

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
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
      className={`group flex overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-200/60 bg-white p-3 sm:p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-200/50 ${
        viewMode === 'list' ? 'flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-center' : 'flex-col'
      }`}
    >
      <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl bg-zinc-50 shrink-0 ${
        viewMode === 'list' ? `w-full sm:w-40 ${aspectRatio} sm:aspect-square` : aspectRatio
      }`}>
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <button
          onClick={handleToggleFavorite}
          className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all ${
            isFavorite ? 'bg-rose-500 text-white shadow-md' : 'bg-white/80 text-zinc-400 hover:bg-white hover:text-rose-500 hover:shadow-md'
          }`}
          aria-label="В избранное"
        >
          <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
        </button>
      </div>

      {viewMode === 'list' ? (
        <div className="flex flex-1 flex-col sm:flex-row gap-4 justify-between h-full py-2">
          <div className="flex flex-col flex-1 justify-center">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">{product.category}</span>
            <h3 className="mt-1 sm:mt-2 font-semibold leading-snug text-zinc-900 group-hover:text-emerald-600 transition-colors text-base sm:text-lg line-clamp-2">
              {product.name}
            </h3>
            <p className="mt-2 text-sm text-zinc-500 line-clamp-2 hidden sm:block">{product.shortDescription}</p>
          </div>
          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 sm:w-48 shrink-0 border-t sm:border-t-0 sm:border-l border-zinc-100 pt-4 sm:pt-0 sm:pl-6">
            <div className="flex flex-col items-start sm:items-end">
              {product.oldPrice && <span className="text-xs font-medium text-zinc-400 line-through mb-0.5">{formatPrice(product.oldPrice)}</span>}
              <span className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900">{formatPrice(product.price)}</span>
            </div>
            {cartItem ? (
              <div className="flex h-10 items-center rounded-full border border-emerald-500 bg-emerald-50/50">
                <button onClick={(e) => handleUpdateQuantity(e, cartItem.quantity - 1)} className="flex h-full w-10 items-center justify-center text-emerald-600 hover:bg-emerald-100/50 rounded-l-full transition-colors"><Minus size={16} /></button>
                <span className="flex w-8 items-center justify-center text-sm font-bold text-emerald-900">{cartItem.quantity}</span>
                <button onClick={(e) => handleUpdateQuantity(e, cartItem.quantity + 1)} className="flex h-full w-10 items-center justify-center text-emerald-600 hover:bg-emerald-100/50 rounded-r-full transition-colors"><Plus size={16} /></button>
              </div>
            ) : (
              <button onClick={handleAddToCart} className="flex h-10 px-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-900 transition-all hover:bg-emerald-500 hover:text-white hover:shadow-md gap-2 font-semibold text-sm w-full sm:w-auto" aria-label="В корзину">
                <ShoppingCart size={16} /><span className="hidden sm:inline">В корзину</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-3 sm:mt-5 flex flex-1 flex-col">
          <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-zinc-400">{product.category}</span>
          <h3 className="mt-1 sm:mt-2 line-clamp-2 text-xs sm:text-sm font-semibold leading-snug text-zinc-900 group-hover:text-emerald-600 transition-colors">{product.name}</h3>
          <div className="mt-auto pt-3 sm:pt-5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div className="flex flex-col">
                {product.oldPrice && <span className="text-[10px] sm:text-xs font-medium text-zinc-400 line-through mb-0.5">{formatPrice(product.oldPrice)}</span>}
                <span className="text-base sm:text-lg font-bold tracking-tight text-zinc-900">{formatPrice(product.price)}</span>
              </div>
              {cartItem ? (
                <div className="flex h-8 sm:h-10 items-center rounded-full border border-emerald-500 bg-emerald-50/50 w-full sm:w-auto justify-between sm:justify-start">
                  <button onClick={(e) => handleUpdateQuantity(e, cartItem.quantity - 1)} className="flex h-full w-8 items-center justify-center text-emerald-600 hover:bg-emerald-100/50 rounded-l-full transition-colors"><Minus size={14} /></button>
                  <span className="flex w-6 items-center justify-center text-xs sm:text-sm font-bold text-emerald-900">{cartItem.quantity}</span>
                  <button onClick={(e) => handleUpdateQuantity(e, cartItem.quantity + 1)} className="flex h-full w-8 items-center justify-center text-emerald-600 hover:bg-emerald-100/50 rounded-r-full transition-colors"><Plus size={14} /></button>
                </div>
              ) : (
                <button onClick={handleAddToCart} className="flex h-8 sm:h-10 w-full sm:w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-900 transition-all hover:bg-emerald-500 hover:text-white hover:shadow-md gap-2" aria-label="В корзину">
                  <ShoppingCart size={16} /><span className="sm:hidden text-xs font-bold">В корзину</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Link>
  );
};
