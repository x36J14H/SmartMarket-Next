import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
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
    }),
    { name: 'favorites-storage' }
  )
);
