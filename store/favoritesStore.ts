import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// UUID v4 pattern
const isGuid = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

interface FavoritesState {
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  clearInvalid: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (productId) => {
        set((state) => {
          const isFav = state.favorites.includes(productId);
          return isFav
            ? { favorites: state.favorites.filter((id) => id !== productId) }
            : { favorites: [...state.favorites, productId] };
        });
      },
      isFavorite: (productId) => get().favorites.includes(productId),
      clearInvalid: () =>
        set((state) => ({ favorites: state.favorites.filter(isGuid) })),
    }),
    {
      name: 'favorites-storage',
      // При загрузке из localStorage чистим невалидные (не-GUID) id
      onRehydrateStorage: () => (state) => {
        if (state) state.clearInvalid();
      },
    }
  )
);
