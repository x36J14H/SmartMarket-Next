// Сервисный слой для Orders API 1С
// Все запросы идут через прокси /api/orders/*

export interface OrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  sum: number;
}

export interface Order {
  id: string;
  number: string;
  date: string;
  status: string;
  source?: string;
  total: number;
  items?: OrderItem[];
  delivery_address?: string;
  delivery_method?: string;
  payment_method?: string;
  comment?: string;
}

export interface CreateOrderPayload {
  items: { id: string; qty: number }[];
  delivery_address?: string;
  delivery_method?: string;
  payment_method?: string;
  comment?: string;
}

export interface OutOfStockItem {
  id: string;
  name: string;
  requested: number;
  available: number;
}

export interface CreateOrderError {
  error: string;
  out_of_stock?: OutOfStockItem[];
}

const BASE = '/api/personal';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    signal: init?.signal ?? AbortSignal.timeout(15000),
  });

  if (res.status === 401) throw new Error('unauthorized');

  const text = await res.text();
  const data = text.trim() ? JSON.parse(text) : {};

  if (!res.ok) {
    const err = data as CreateOrderError;
    const error = new Error(err.error ?? `Ошибка ${res.status}`) as Error & {
      out_of_stock?: OutOfStockItem[];
    };
    if (err.out_of_stock) error.out_of_stock = err.out_of_stock;
    throw error;
  }

  return data as T;
}

export const ordersService = {
  getOrders: () => request<Order[]>('/orders'),

  getOrder: (id: string) => request<Order>(`/orders/${id}`),

  createOrder: (payload: CreateOrderPayload) =>
    request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
