'use client';

import { ShoppingCart, Menu, X, Heart, User } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useCartStore } from '../store/cartStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { AISearchBar } from './AISearchBar';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const favoritesCount = useFavoritesStore((state) => state.favorites.length);

  const navLinks = [
    { name: 'Главная', path: '/' },
    { name: 'Каталог', path: '/catalog' },
    { name: 'О нас', path: '/about' },
    { name: 'Контакты', path: '/contacts' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 bg-white/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-2xl p-2 text-zinc-500 hover:bg-zinc-100/80 md:hidden transition-colors"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-zinc-900 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-sm transition-transform group-hover:scale-105 group-hover:rotate-3">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <span className="hidden sm:inline-block">MarketMVP</span>
          </Link>
        </div>

        <nav className="hidden md:flex md:gap-8 ml-12">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              className="text-sm font-bold text-zinc-500 transition-colors hover:text-zinc-900"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4">
          <AISearchBar className="hidden sm:block mx-4" />

          <Link href="/profile" className="relative flex items-center gap-2 rounded-2xl p-2 text-zinc-500 hover:bg-zinc-100/80 hover:text-zinc-900 transition-colors">
            <User size={20} />
          </Link>

          <Link href="/favorites" className="relative flex items-center gap-2 rounded-2xl p-2 text-zinc-500 hover:bg-zinc-100/80 hover:text-rose-500 transition-colors">
            <Heart size={20} />
            {favoritesCount > 0 && (
              <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">
                {favoritesCount}
              </span>
            )}
          </Link>

          <Link href="/cart" className="relative flex items-center gap-2 rounded-2xl p-2 text-zinc-500 hover:bg-zinc-100/80 hover:text-emerald-600 transition-colors">
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white ring-2 ring-white">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-zinc-200/50 bg-white/95 backdrop-blur-xl px-4 py-6 md:hidden shadow-lg overflow-hidden"
          >
            <div className="mb-6">
              <AISearchBar className="w-full" onResultClick={() => setIsMenuOpen(false)} />
            </div>
            <nav className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg font-bold text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
