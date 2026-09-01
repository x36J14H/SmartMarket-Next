import { NextRequest, NextResponse } from 'next/server';

const AI_CHAT_URL = `${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/api/v1/chat`;

// UUID-ссылки вида /products/<uuid> или просто <uuid> заменяем на /product/<uuid>
// Резолвинг UUID→slug убран: страница /product/[slug] сама обрабатывает UUID через GET /catalog/{id}
const PRODUCT_LINK_RE = /\((?:\/products\/)?([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\)/gi;

// Известные страницы сайта — для автофикса ссылок
const KNOWN_PAGES: Record<string, string> = {
  '/profile':   '/profile',
  '/catalog':   '/catalog',
  '/cart':      '/cart',
  '/favorites': '/favorites',
  '/search':    '/search',
  '/checkout':  '/checkout',
  '/about':     '/about',
  '/contacts':  '/contacts',
};

/**
 * Нормализует ссылки в markdown-тексте от AI:
 *
 * 1. [текст](/products/<uuid>)  →  [текст](/product/<uuid>)
 * 2. [/profile]                 →  [Личный кабинет](/profile)   — путь как текст без href
 * 3. [текст][/profile]          →  [текст](/profile)            — reference-style ссылка
 * 4. ссылки вида /profile без markdown — оставляем как есть (не ломаем plain text)
 */
function normalizeLinks(text: string): string {
  // 1. UUID в неверном пути /products/ → /product/
  let result = text.replace(PRODUCT_LINK_RE, (_, id: string) => `(/product/${id})`);

  // 2. [/known-path] без href → превращаем в нормальную ссылку
  //    Пример: [/profile] → [Личный кабинет](/profile)
  const PATH_AS_TEXT_RE = /\[(\/[^\]\s]*)\](?!\()/g;
  result = result.replace(PATH_AS_TEXT_RE, (match, path: string) => {
    // Берём базовый путь без query/hash для поиска в словаре
    const basePath = path.split('?')[0].split('#')[0];
    if (KNOWN_PAGES[basePath]) {
      const label = PATH_LABELS[basePath] ?? path;
      return `[${label}](${path})`;
    }
    return match; // неизвестный путь — не трогаем
  });

  // 3. Reference-style: [текст][/path] → [текст](/path)
  const REF_STYLE_RE = /\[([^\]]+)\]\[(\/?[^\]\s]+)\]/g;
  result = result.replace(REF_STYLE_RE, (match, label: string, ref: string) => {
    const basePath = ref.startsWith('/') ? ref.split('?')[0] : null;
    if (basePath && KNOWN_PAGES[basePath]) {
      return `[${label}](${ref})`;
    }
    return match;
  });

  // 4. Если товары идут подряд без переноса строки (например, "... руб. [Следующий товар](/product/...)"),
  //    добавляем перенос строки для чистого форматирования
  result = result.replace(/([0-9\s]+(?:руб\.?|₽))\s*(?=\[)/gi, '$1\n');

  return result;
}

// Человекочитаемые названия для известных страниц
const PATH_LABELS: Record<string, string> = {
  '/profile':   'Личный кабинет',
  '/catalog':   'Каталог',
  '/cart':      'Корзина',
  '/favorites': 'Избранное',
  '/search':    'Поиск',
  '/checkout':  'Оформление заказа',
  '/about':     'О нас',
  '/contacts':  'Контакты',
};

export async function POST(req: NextRequest) {
  try {
    const { message, session_id } = await req.json();

    const res = await fetch(AI_CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: message, session_id: session_id || 'default' }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'AI service error' }, { status: res.status });
    }

    const data = await res.json();
    const answer: string = data.answer || '';

    return NextResponse.json({ text: normalizeLinks(answer) });
  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json({ error: 'AI service error' }, { status: 500 });
  }
}
