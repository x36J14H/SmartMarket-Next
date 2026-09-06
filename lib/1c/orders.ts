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
  total_amount?: number;
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

const BASE = '/api/orders';

export function normalizeOrderDate(rawDate: unknown): string {
  if (!rawDate) return '';
  if (typeof rawDate === 'string') {
    const match = /\/Date\((\d+)(?:[+-]\d+)?\)\//.exec(rawDate);
    if (match) {
      return new Date(parseInt(match[1], 10)).toISOString();
    }
  }
  const d = new Date(rawDate as string | number);
  if (!isNaN(d.getTime())) {
    return d.toISOString();
  }
  return String(rawDate);
}

export function normalizeOrder(raw: any): Order {
  if (!raw || typeof raw !== 'object') return raw;
  const rawTotal = raw.total ?? raw.total_amount ?? 0;
  const total = Number(rawTotal);
  const normalizedTotal = isNaN(total) ? 0 : total;
  return {
    ...raw,
    total: normalizedTotal,
    total_amount: normalizedTotal,
    date: normalizeOrderDate(raw.date),
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = path ? `${BASE}${path}` : BASE;
  const res = await fetch(url, {
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
  getOrders: async () => {
    const list = await request<Order[]>('');
    return Array.isArray(list) ? list.map(normalizeOrder) : [];
  },

  getOrder: async (id: string) => {
    const data = await request<Order>(`/${id}`);
    return normalizeOrder(data);
  },

  createOrder: async (payload: CreateOrderPayload) => {
    const data = await request<any>('', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const orderData = data?.order ? { ...data.order, ...data } : data;
    return normalizeOrder(orderData);
  },
};
