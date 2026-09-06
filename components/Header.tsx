'use client';

import { ShoppingCart, Menu, X, Heart, User as UserIcon } from 'lucide-react';
import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useCartStore } from '../store/cartStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { useAuthStore } from '../store/authStore';
import { AISearchBar } from './AISearchBar';
import { AuthModal } from './AuthModal';

// Отдельный компонент для чтения searchParams (требует Suspense)
function AuthParamWatcher({ onOpen }: { onOpen: () => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams.get('auth') === '1') {
      onOpen();
      const params = new URLSearchParams(searchParams.toString());
      params.delete('auth');
      router.replace(pathname + (params.size ? `?${params}` : ''));
    }
  }, [searchParams, pathname, router, onOpen]);

  return null;
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const pathname = usePathname();
  const totalItems = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const favoritesCount = useFavoritesStore((state) => state.favorites.length);
  const { user, isLoading } = useAuthStore();

  const navLinks = [
    { name: 'Главная', path: '/' },
    { name: 'Каталог', path: '/catalog' },
    { name: 'О нас', path: '/about' },
    { name: 'Контакты', path: '/contacts' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      <Suspense fallback={null}>
        <AuthParamWatcher onOpen={() => setAuthOpen(true)} />
      </Suspense>

      <header className="sticky top-0 z-50 w-full border-b border-zinc-200/70 bg-white/85 backdrop-blur-2xl transition-all duration-300 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)]">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo & Mobile Toggle */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-2xl p-2 text-zinc-600 hover:bg-zinc-100/90 md:hidden transition-colors"
              aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <Link
              href="/"
              className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-zinc-950 group select-none"
            >
              <div className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-md transition-all duration-300 group-hover:scale-105 group-hover:bg-zinc-900">
                <span className="text-emerald-400 font-display font-black text-lg">S</span>
              </div>
              <div className="flex items-center">
                <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-zinc-950">
                  Smart<span className="text-emerald-600">Market</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:gap-1 lg:gap-2 ml-8">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`relative px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 rounded-full ${
                    active
                      ? 'text-zinc-950 bg-zinc-100/90 shadow-2xs font-bold'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
                  }`}
                >
                  {link.name}
                  {active && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-full bg-zinc-100 -z-10 ring-1 ring-zinc-200/60"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Search, User, Favorites & Cart */}
          <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3 ml-4">
            <Suspense fallback={null}>
              <AISearchBar className="hidden sm:flex items-center mx-2 w-full max-w-xs lg:max-w-md" />
            </Suspense>

            {/* Profile / Login */}
            {isLoading ? (
              <div className="h-9 w-9 rounded-2xl bg-zinc-100 animate-pulse" />
            ) : user ? (
              <Link
                href="/profile"
                className="group relative flex items-center gap-2 rounded-2xl p-1.5 sm:px-3 sm:py-1.5 text-zinc-700 hover:bg-zinc-100/80 transition-all"
                title={user.name}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-xs font-bold text-white shadow-sm ring-2 ring-white">
                  {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={15} />}
                </div>
                <span className="hidden xl:inline-block text-xs font-bold text-zinc-800 max-w-[100px] truncate">
                  {user.name}
                </span>
              </Link>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="shimmer-btn flex items-center gap-1.5 rounded-2xl bg-zinc-950 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-zinc-800 hover:shadow-md active:scale-95 transition-all"
              >
                <span>Войти</span>
              </button>
            )}

            {/* Favorites Icon */}
            <Link
              href="/favorites"
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl text-zinc-600 hover:bg-zinc-100 hover:text-rose-500 transition-colors"
              aria-label="Избранное"
            >
              <Heart size={20} />
              <AnimatePresence>
                {favoritesCount > 0 && (
                  <motion.span
                    key="fav-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white tabular-nums"
                  >
                    {favoritesCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl text-zinc-600 hover:bg-zinc-100 hover:text-emerald-600 transition-colors"
              aria-label="Корзина"
            >
              <ShoppingCart size={20} />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    key="cart-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white tabular-nums"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="border-t border-zinc-200/70 bg-white/95 backdrop-blur-2xl px-4 py-5 md:hidden shadow-xl overflow-hidden"
            >
              <div className="mb-4">
                <Suspense fallback={null}>
                  <AISearchBar className="w-full" onResultClick={() => setIsMenuOpen(false)} />
                </Suspense>
              </div>
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => {
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.name}
                      href={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3 text-base font-bold transition-all ${
                        active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950'
                      }`}
                    >
                      <span>{link.name}</span>
                      {active && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400 font-medium">
                <span>Поддержка: 8 (800) 000-00-00</span>
                <span className="text-emerald-600 font-semibold">24/7 AI Online</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
