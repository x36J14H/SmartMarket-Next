import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '../types';
import { personalService } from '../lib/1c/personal';

interface CartState {
  items: CartItem[];
  synced: boolean;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  mergeToServer: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  reset: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      synced: false,

      addItem: async (product, quantity = 1) => {
        const inStock = product.inStock ?? 0;
        set((state) => {
          const existing = state.items.find((i) => i.id === product.id);
          if (existing) {
            const newQty = inStock > 0
              ? Math.min(existing.quantity + quantity, inStock)
              : existing.quantity + quantity;
            return {
              items: state.items.map((i) =>
                i.id === product.id ? { ...i, quantity: newQty } : i
              ),
            };
          }
          const initialQty = inStock > 0 ? Math.min(quantity, inStock) : quantity;
          return { items: [...state.items, { ...product, quantity: initialQty }] };
        });

        try {
          await personalService.addToCart(product.id, quantity);
        } catch (e) {
          if (e instanceof Error && e.message === 'unauthorized') return;
          set((state) => {
            const existing = state.items.find((i) => i.id === product.id);
            if (!existing) return state;
            const newQty = existing.quantity - quantity;
            return {
              items:
                newQty <= 0
                  ? state.items.filter((i) => i.id !== product.id)
                  : state.items.map((i) =>
                      i.id === product.id ? { ...i, quantity: newQty } : i
                    ),
            };
          });
        }
      },

      removeItem: async (productId) => {
        const prev = get().items;
        set((state) => ({ items: state.items.filter((i) => i.id !== productId) }));

        try {
          await personalService.removeFromCart(productId);
        } catch (e) {
          if (e instanceof Error && e.message === 'unauthorized') return;
          set({ items: prev });
        }
      },

      updateQuantity: async (productId, quantity) => {
        const prev = get().items;
        const item = prev.find((i) => i.id === productId);
        const inStock = item?.inStock ?? 0;
        const clampedQty = inStock > 0 ? Math.min(quantity, inStock) : quantity;

        if (clampedQty <= 0) {
          set((state) => ({ items: state.items.filter((i) => i.id !== productId) }));
        } else {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === productId ? { ...i, quantity: clampedQty } : i
            ),
          }));
        }

        try {
          await personalService.updateCartItem(productId, quantity);
        } catch (e) {
          if (e instanceof Error && e.message === 'unauthorized') return;
          set({ items: prev });
        }
      },

      clearCart: async () => {
        const prev = get().items;
        set({ items: [] });

        try {
          await personalService.clearCart();
        } catch (e) {
          if (e instanceof Error && e.message === 'unauthorized') return;
          set({ items: prev });
        }
      },

      // Заливает локальные (гостевые) товары в аккаунт после логина.
      // POST /cart/{id} на стороне 1С увеличивает qty если товар уже есть — дублей не будет.
      mergeToServer: async () => {
        const localItems = get().items;
        if (localItems.length === 0) return;

        await Promise.allSettled(
          localItems.map((item) => personalService.addToCart(item.id, item.quantity))
        );
      },

      syncWithServer: async () => {
        try {
          const serverItems = await personalService.getCart();
          set({
            items: serverItems.map((i) => ({
              id: i.id,
              name: i.name,
              article: i.article,
              slug: i.slug,
              price: i.price,
              imageUrl: i.imageUrl
                ? `/api/1c/catalog/${i.id}/images/${i.imageUrl}`
                : '/service/image-unavailable.png',
              quantity: i.qty,
              inStock: 0,
              category: '',
              categorySlug: '',
              subcategory: '',
              subcategorySlug: '',
              type: '',
              typeSlug: '',
              brand: '',
              brandSlug: '',
              description: '',
              shortDescription: '',
              images: [],
              characteristics: {},
              sku: i.article,
            })),
            synced: true,
          });
        } catch (e) {
          if (e instanceof Error && e.message === 'unauthorized') return;
        }
      },

      reset: () => set({ items: [], synced: false }),

      getTotalPrice: () =>
        get().items.reduce((total, item) => total + item.price * item.quantity, 0),

      getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),
    }),
    { name: 'cart-storage' }
  )
);
