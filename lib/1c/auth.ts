// Сервисный слой для Auth API 1С
// Все запросы идут через наш прокси /api/auth/*

export interface AuthToken {
  token: string;
  expires_in: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

const BASE = '/api/auth';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  const text = await res.text();
  let data: Record<string, unknown> = {};
  if (text.trim()) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Некорректный ответ сервера (HTTP ${res.status})`);
    }
  }

  if (!res.ok) {
    throw new Error((data.error as string) ?? `Ошибка ${res.status}`);
  }

  return data as T;
}

export const authService = {
  register: (email: string, password: string, name?: string) =>
    request<{ ok: true }>('/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  confirmEmail: (email: string, code: string) =>
    request<AuthToken>('/confirm-email', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    }),

  login: (email: string, password: string) =>
    request<{ ok: true }>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  forgotPassword: (email: string) =>
    request<{ ok: true }>('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (email: string, code: string, new_password: string) =>
    request<{ ok: true }>('/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, new_password }),
    }),

  changePassword: (current_password: string, new_password: string) =>
    request<{ ok: true }>('/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password }),
    }),

  getProfile: () => request<UserProfile>('/profile'),

  logout: () => request<{ ok: true }>('/logout', { method: 'POST' }),
};
