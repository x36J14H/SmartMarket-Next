import { UpdateProfileData } from './auth';
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

export interface PurchasedProduct {
  id: string;
  name: string;
  article: string;
  slug: string;
  price: number;
  totalQty: number;
  orderDate: string;
  orderNumber: string;
  imageUrl: string;
  hasReview: boolean;
  reviewId?: string | null;
  reviewRating?: number;
  reviewText?: string;
}

export interface UserReviewItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImageUrl: string;
  rating: number;
  text: string;
  reply?: string | null;
  replyDate?: string | null;
  date: string;
  published: boolean;
}

export interface UserQuestionItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImageUrl: string;
  text: string;
  reply?: string | null;
  replyDate?: string | null;
  date: string;
  published: boolean;
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
  let data: any = {};
  if (text.trim()) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text.trim() || `Ошибка сервера (HTTP ${res.status})` };
    }
  }

  if (!res.ok) throw new Error((data as Record<string, string>).error ?? `Ошибка ${res.status}`);
  return data as T;
}

export function normalizePersonalImageUrl(productId: string, fileId?: string | null): string {
  if (!fileId) return '';
  const trimmed = fileId.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
    return trimmed;
  }
  return `/api/1c/catalog/${productId}/images/${trimmed}`;
}

export const personalService = {
  // Профиль
  updateProfile: (data: UpdateProfileData) =>
    request<{ ok: true }>('/profile', { method: 'PATCH', body: JSON.stringify(data) }),

  // Избранное
  getWishlist: async () => {
    const items = await request<WishlistItem[]>('/wishlist');
    return (items || []).map((item) => ({
      ...item,
      imageUrl: normalizePersonalImageUrl(item.id, item.imageUrl),
    }));
  },
  addToWishlist: (id: string) => request<{ ok: true }>(`/wishlist/${id}`, { method: 'POST' }),
  removeFromWishlist: (id: string) => request<{ ok: true }>(`/wishlist/${id}`, { method: 'DELETE' }),

  // Корзина
  getCart: async () => {
    const items = await request<CartItem[]>('/cart');
    return (items || []).map((item) => ({
      ...item,
      imageUrl: normalizePersonalImageUrl(item.id, item.imageUrl),
    }));
  },
  addToCart: (id: string, qty = 1) =>
    request<{ ok: true }>(`/cart/${id}`, { method: 'POST', body: JSON.stringify({ qty }) }),
  updateCartItem: (id: string, qty: number) =>
    request<{ ok: true }>(`/cart/${id}`, { method: 'PATCH', body: JSON.stringify({ qty }) }),
  removeFromCart: (id: string) => request<{ ok: true }>(`/cart/${id}`, { method: 'DELETE' }),
  clearCart: () => request<{ ok: true }>('/cart', { method: 'DELETE' }),

  // Купленные товары, отзывы и вопросы
  getPurchasedProducts: async () => {
    const items = await request<PurchasedProduct[]>('/purchases');
    return (items || []).map((item) => ({
      ...item,
      imageUrl: normalizePersonalImageUrl(item.id, item.imageUrl),
    }));
  },
  getMyReviews: async () => {
    const items = await request<UserReviewItem[]>('/reviews');
    return (items || []).map((item) => ({
      ...item,
      productImageUrl: normalizePersonalImageUrl(item.productId, item.productImageUrl),
    }));
  },
  getMyQuestions: async () => {
    const items = await request<UserQuestionItem[]>('/questions');
    return (items || []).map((item) => ({
      ...item,
      productImageUrl: normalizePersonalImageUrl(item.productId, item.productImageUrl),
    }));
  },
};
