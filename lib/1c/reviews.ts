// Сервисный слой для отзывов и вопросов к товару
// Запросы идут через прокси /api/1c/catalog/{id}/reviews|questions

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  reply?: string;
  replyDate?: string;
  date: string;
}

export interface ReviewsResponse {
  total: number;
  rating: number;
  page: number;
  limit: number;
  items: Review[];
}

export interface Question {
  id: string;
  author: string;
  text: string;
  reply?: string;
  replyDate?: string;
  date: string;
}

export interface QuestionsResponse {
  total: number;
  page: number;
  limit: number;
  items: Question[];
}

export interface SubmitReviewPayload {
  rating: number;
  text: string;
}

export interface SubmitQuestionPayload {
  text: string;
}

export interface SubmitResult {
  ok: boolean;
  id: string;
  date: string;
}

const BASE = '/api/1c';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/${path}`, {
    ...init,
    signal: init?.signal ?? AbortSignal.timeout(15000),
  });

  const text = await res.text();
  const data = text.trim() ? JSON.parse(text) : {};

  if (!res.ok) {
    const err = data as { error?: string };
    throw Object.assign(new Error(err.error ?? `Ошибка ${res.status}`), {
      status: res.status,
    });
  }

  return data as T;
}

export const reviewsService = {
  /** Получить отзывы к товару */
  getReviews: (
    productId: string,
    params: { page?: number; limit?: number } = {},
    signal?: AbortSignal,
  ): Promise<ReviewsResponse> => {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return request<ReviewsResponse>(
      `catalog/${productId}/reviews${query}`,
      { signal },
    );
  },

  /** Оставить отзыв (только авторизованный купивший) */
  submitReview: (
    productId: string,
    payload: SubmitReviewPayload,
  ): Promise<SubmitResult> =>
    request<SubmitResult>(`catalog/${productId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),

  /** Получить вопросы к товару */
  getQuestions: (
    productId: string,
    params: { page?: number; limit?: number } = {},
    signal?: AbortSignal,
  ): Promise<QuestionsResponse> => {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return request<QuestionsResponse>(
      `catalog/${productId}/questions${query}`,
      { signal },
    );
  },

  /** Задать вопрос (только авторизованный) */
  submitQuestion: (
    productId: string,
    payload: SubmitQuestionPayload,
  ): Promise<SubmitResult> =>
    request<SubmitResult>(`catalog/${productId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
};
