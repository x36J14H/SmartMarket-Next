// Сервисный слой для Personal API 1С (корзина и избранное)
// Все запросы идут через прокси /api/personal/*

export interface WishlistItem {
  id: string;
  name: string;
  article: string;
  slug: string;
  price: number;
  imageUrl: string;
}

export interface CartItem {
  id: string;
  name: string;
  article: string;
  slug: string;
  price: number;
  imageUrl: string;
  qty: number;
}

const BASE = '/api/personal';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    signal: init?.signal ?? AbortSignal.timeout(10000),
  });

  if (res.status === 401) throw new Error('unauthorized');

  const text = await res.text();
  const data = text.trim() ? JSON.parse(text) : {};

  if (!res.ok) throw new Error((data as Record<string, string>).error ?? `Ошибка ${res.status}`);
  return data as T;
}

export const personalService = {
  // Избранное
  getWishlist: () => request<WishlistItem[]>('/wishlist'),
  addToWishlist: (id: string) => request<{ ok: true }>(`/wishlist/${id}`, { method: 'POST' }),
  removeFromWishlist: (id: string) => request<{ ok: true }>(`/wishlist/${id}`, { method: 'DELETE' }),

  // Корзина
  getCart: () => request<CartItem[]>('/cart'),
  addToCart: (id: string, qty = 1) =>
    request<{ ok: true }>(`/cart/${id}`, { method: 'POST', body: JSON.stringify({ qty }) }),
  updateCartItem: (id: string, qty: number) =>
    request<{ ok: true }>(`/cart/${id}`, { method: 'PATCH', body: JSON.stringify({ qty }) }),
  removeFromCart: (id: string) => request<{ ok: true }>(`/cart/${id}`, { method: 'DELETE' }),
  clearCart: () => request<{ ok: true }>('/cart', { method: 'DELETE' }),
};
