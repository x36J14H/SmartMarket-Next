'use client';

import { ShoppingCart, Menu, X, Heart } from 'lucide-react';
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
  const totalItems = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const favoritesCount = useFavoritesStore((state) => state.favorites.length);
  const { user, isLoading } = useAuthStore();

  const navLinks = [
    { name: 'Главная', path: '/' },
    { name: 'Каталог', path: '/catalog' },
    { name: 'О нас', path: null },
    { name: 'Контакты', path: null },
  ];

  return (
    <>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      <Suspense fallback={null}>
        <AuthParamWatcher onOpen={() => setAuthOpen(true)} />
      </Suspense>

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
            {navLinks.map((link) =>
              link.path ? (
                <Link
                  key={link.name}
                  href={link.path}
                  className="text-sm font-bold text-zinc-500 transition-colors hover:text-zinc-900"
                >
                  {link.name}
                </Link>
              ) : (
                <span
                  key={link.name}
                  title="В разработке"
                  className="text-sm font-bold text-zinc-300 cursor-not-allowed select-none"
                >
                  {link.name}
                </span>
              )
            )}
          </nav>

          <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4">
            <Suspense fallback={null}>
              <AISearchBar className="hidden sm:block mx-4" />
            </Suspense>

            {isLoading ? (
              <div className="h-9 w-9 rounded-2xl bg-zinc-100 animate-pulse" />
            ) : user ? (
              <Link
                href="/profile"
                className="relative flex items-center gap-2 rounded-2xl p-2 text-zinc-500 hover:bg-zinc-100/80 hover:text-zinc-900 transition-colors"
                title={user.name}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </Link>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="flex items-center gap-1.5 rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-bold text-white hover:bg-zinc-700 transition-colors"
              >
                Войти
              </button>
            )}

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
                <Suspense fallback={null}>
                  <AISearchBar className="w-full" onResultClick={() => setIsMenuOpen(false)} />
                </Suspense>
              </div>
              <nav className="flex flex-col gap-6">
                {navLinks.map((link) =>
                  link.path ? (
                    <Link
                      key={link.name}
                      href={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className="text-lg font-bold text-zinc-600 hover:text-zinc-900 transition-colors"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <span
                      key={link.name}
                      className="text-lg font-bold text-zinc-300 cursor-not-allowed select-none"
                    >
                      {link.name}
                    </span>
                  )
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
