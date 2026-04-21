'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useFavoritesStore } from '../store/favoritesStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();
  const syncCart = useCartStore((s) => s.syncWithServer);
  const resetCart = useCartStore((s) => s.reset);
  const syncFavorites = useFavoritesStore((s) => s.syncWithServer);
  const resetFavorites = useFavoritesStore((s) => s.reset);

  useEffect(() => {
    fetch('/api/auth/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => {
        setUser(user);
        if (user) {
          // Пользователь залогинен — загружаем данные с сервера
          syncCart();
          syncFavorites();
        } else {
          // Не залогинен — сбрасываем серверные данные
          resetCart();
          resetFavorites();
        }
      })
      .catch(() => setLoading(false));
  }, [setUser, setLoading, syncCart, syncFavorites, resetCart, resetFavorites]);

  return <>{children}</>;
}
