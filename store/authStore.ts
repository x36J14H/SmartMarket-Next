import { create } from 'zustand';
import type { UserProfile } from '../lib/1c/auth';

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),

  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    set({ user: null });
    // Сброс корзины и избранного при выходе
    // Импортируем динамически чтобы избежать циклических зависимостей
    const { useCartStore } = await import('./cartStore');
    const { useFavoritesStore } = await import('./favoritesStore');
    useCartStore.getState().reset();
    useFavoritesStore.getState().reset();
  },
}));
