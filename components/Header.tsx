'use client';

import { ShoppingCart, Menu, X, Heart, User as UserIcon, Home, LayoutGrid } from 'lucide-react';
import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useCartStore } from '../store/cartStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { useAuthStore } from '../store/authStore';
import { AISearchBar } from './AISearchBar';
import { AuthModal } from './AuthModal';
import { settingsService, DEFAULT_STORE_SETTINGS, type StoreSettings } from '../lib/1c/settings';

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
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  useEffect(() => {
    settingsService.getSettings().then(setStoreSettings);
  }, []);

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
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 lg:px-8">
          {/* Brand Logo & Mobile Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-xl p-1.5 text-zinc-600 hover:bg-zinc-100/90 lg:hidden transition-colors"
              aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <Link
              href="/"
              className="flex items-center gap-2 text-base sm:text-xl font-extrabold tracking-tight text-zinc-950 group select-none shrink-0"
            >
              <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl sm:rounded-2xl bg-zinc-950 text-white shadow-md transition-all duration-300 group-hover:scale-105 group-hover:bg-zinc-900 shrink-0">
                <span className="text-emerald-400 font-display font-black text-base sm:text-lg">S</span>
              </div>
              <div className="flex items-center">
                <span className="font-display font-extrabold text-base sm:text-xl tracking-tight text-zinc-950">
                  Smart<span className="text-emerald-600">Market</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation (visible on lg: >= 1024px) */}
          <nav className="hidden lg:flex lg:items-center lg:gap-1 xl:gap-2 ml-2 xl:ml-6 shrink-0">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`relative px-3 py-1.5 text-xs xl:text-sm font-semibold transition-all duration-200 rounded-full ${
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

          {/* Search Bar: centered/flexible on sm: and up, shrinks smoothly without pushing action buttons off */}
          <div className="hidden sm:flex flex-1 min-w-0 max-w-xs md:max-w-sm lg:max-w-md mx-1 sm:mx-2">
            <Suspense fallback={null}>
              <AISearchBar className="w-full" />
            </Suspense>
          </div>

          {/* Action Group: Profile, Favorites & Cart (Hidden on mobile < md, where bottom nav is used) */}
          <div className="hidden md:flex items-center justify-end gap-1 sm:gap-2 md:gap-2.5 shrink-0 ml-auto sm:ml-0">
            {/* Profile / Login */}
            {isLoading ? (
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl sm:rounded-2xl bg-zinc-100 animate-pulse shrink-0" />
            ) : user ? (
              <Link
                href="/profile"
                className="group relative flex items-center gap-1.5 rounded-xl sm:rounded-2xl p-1 sm:px-2.5 sm:py-1.5 text-zinc-700 hover:bg-zinc-100/80 transition-all shrink-0"
                title={user.name}
              >
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-xs font-bold text-white shadow-sm ring-2 ring-white">
                  {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={14} />}
                </div>
                <span className="hidden 2xl:inline-block text-xs font-bold text-zinc-800 max-w-[100px] truncate">
                  {user.name}
                </span>
              </Link>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="shimmer-btn flex items-center gap-1 rounded-xl sm:rounded-2xl bg-zinc-950 px-2 sm:px-3 sm:py-1.5 md:px-3.5 md:py-2 text-xs font-bold text-white shadow-sm hover:bg-zinc-800 hover:shadow-md active:scale-95 transition-all shrink-0"
              >
                <UserIcon size={14} className="sm:hidden" />
                <span className="hidden sm:inline">Войти</span>
              </button>
            )}

            {/* Favorites Icon */}
            <Link
              href="/favorites"
              className="relative flex h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 items-center justify-center rounded-xl sm:rounded-2xl text-zinc-600 hover:bg-zinc-100 hover:text-rose-500 transition-colors shrink-0"
              aria-label="Избранное"
            >
              <Heart size={19} />
              <AnimatePresence>
                {favoritesCount > 0 && (
                  <motion.span
                    key="fav-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-0.5 -top-0.5 sm:right-0.5 sm:top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] sm:text-[10px] font-bold text-white shadow-sm ring-2 ring-white tabular-nums"
                  >
                    {favoritesCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative flex h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 items-center justify-center rounded-xl sm:rounded-2xl text-zinc-600 hover:bg-zinc-100 hover:text-emerald-600 transition-colors shrink-0"
              aria-label="Корзина"
            >
              <ShoppingCart size={19} />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    key="cart-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-0.5 -top-0.5 sm:right-0.5 sm:top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] sm:text-[10px] font-bold text-white shadow-sm ring-2 ring-white tabular-nums"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>
        </div>

        {/* Mobile & Tablet Navigation Drawer */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="border-t border-zinc-200/70 bg-white/95 backdrop-blur-2xl px-4 py-5 lg:hidden shadow-xl overflow-hidden"
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
                <span>
                  Поддержка:{' '}
                  <a
                    href={`tel:${storeSettings.phone.replace(/[^0-9+]/g, '')}`}
                    className="text-zinc-600 hover:text-emerald-600 font-semibold transition-colors"
                  >
                    {storeSettings.phone}
                  </a>
                </span>
                <span className="text-emerald-600 font-semibold">24/7 AI Online</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Bottom Navigation Bar (Phones) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-2xl border-t border-zinc-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
        <nav className="flex items-center justify-around h-14 px-2">
          {/* Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold transition-colors ${
              pathname === '/' ? 'text-emerald-600' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Home size={18} />
            <span className="mt-1 leading-none">Главная</span>
          </Link>

          {/* Catalog */}
          <Link
            href="/catalog"
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold transition-colors ${
              pathname.startsWith('/catalog') ? 'text-emerald-600' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <LayoutGrid size={18} />
            <span className="mt-1 leading-none">Каталог</span>
          </Link>

          {/* Favorites */}
          <Link
            href="/favorites"
            className={`relative flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold transition-colors ${
              pathname.startsWith('/favorites') ? 'text-rose-600' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <div className="relative">
              <Heart size={18} />
              {favoritesCount > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[8px] font-black text-white leading-none">
                  {favoritesCount}
                </span>
              )}
            </div>
            <span className="mt-1 leading-none">Избранное</span>
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className={`relative flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold transition-colors ${
              pathname.startsWith('/cart') ? 'text-emerald-600' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <div className="relative">
              <ShoppingCart size={18} />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[8px] font-black text-white leading-none">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="mt-1 leading-none">Корзина</span>
          </Link>

          {/* Profile / Auth */}
          {user ? (
            <Link
              href="/profile"
              className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold transition-colors ${
                pathname.startsWith('/profile') ? 'text-emerald-600' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-white">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="mt-1 leading-none truncate max-w-[56px]">Кабинет</span>
            </Link>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <UserIcon size={18} />
              <span className="mt-1 leading-none">Войти</span>
            </button>
          )}
        </nav>
      </div>
    </>
  );
}
