import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { personalService } from '../lib/1c/personal';

const isGuid = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

interface FavoritesState {
  favorites: string[]; // массив UUID
  synced: boolean; // загружены ли данные с сервера
  toggleFavorite: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  syncWithServer: () => Promise<void>;
  clearInvalid: () => void;
  reset: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      synced: false,

      toggleFavorite: async (productId) => {
        const isFav = get().favorites.includes(productId);

        // Оптимистичное обновление
        set((state) => ({
          favorites: isFav
            ? state.favorites.filter((id) => id !== productId)
            : [...state.favorites, productId],
        }));

        try {
          if (isFav) {
            await personalService.removeFromWishlist(productId);
          } else {
            await personalService.addToWishlist(productId);
          }
        } catch (e) {
          if (e instanceof Error && e.message === 'unauthorized') return;
          // Откат при ошибке
          set((state) => ({
            favorites: isFav
              ? [...state.favorites, productId]
              : state.favorites.filter((id) => id !== productId),
          }));
        }
      },

      isFavorite: (productId) => get().favorites.includes(productId),

      syncWithServer: async () => {
        try {
          const items = await personalService.getWishlist();
          set({ favorites: items.map((i) => i.id), synced: true });
        } catch (e) {
          if (e instanceof Error && e.message === 'unauthorized') return;
        }
      },

      clearInvalid: () =>
        set((state) => ({ favorites: state.favorites.filter(isGuid) })),

      reset: () => set({ favorites: [], synced: false }),
    }),
    {
      name: 'favorites-storage',
      onRehydrateStorage: () => (state) => {
        if (state) state.clearInvalid();
      },
    }
  )
);
