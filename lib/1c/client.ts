// Базовый HTTP-клиент для работы с 1С через наш прокси-роут

const BASE = '/api/1c';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/${path}`, {
    ...init,
    signal: init?.signal ?? AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`1C API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export const onecClient = {
  get: <T>(path: string, signal?: AbortSignal) =>
    request<T>(path, { signal }),
};
