/**
 * Утилиты для разрешения изображений товаров и чистого форматирования цен.
 */

// Каталог проверенных изображений товаров из API 1С для номенклатуры
const PRODUCT_IMAGE_FALLBACKS: { test: (slug: string, name: string) => boolean; image: string }[] = [
  // iPhone 15 (из API 1С)
  {
    test: (s, n) => s.includes('iphone') || n.toLowerCase().includes('iphone'),
    image: '/api/1c/catalog/cd077ea2-3370-11f1-8d65-4c2338935cb2/images/04119973-aa1a-11f1-8db7-4c2338935cb1',
  },
  // MacBook Air 13 M4 (из API 1С)
  {
    test: (s, n) => s.includes('macbook') || n.toLowerCase().includes('macbook'),
    image: '/api/1c/catalog/a1d96a75-4bd5-11f1-8d84-4c2338935cb2/images/04119974-aa1a-11f1-8db7-4c2338935cb1',
  },
];

const DEFAULT_FALLBACK_IMAGE = '/service/image-unavailable.svg';

/**
 * Возвращает проверенную фотографию товара по его идентификатору/слагу и названию.
 */
export function getProductFallbackImage(identifier = '', name = ''): string {
  const cleanId = identifier.toLowerCase();
  const cleanName = name.toLowerCase();

  for (const item of PRODUCT_IMAGE_FALLBACKS) {
    if (item.test(cleanId, cleanName)) {
      return item.image;
    }
  }

  return DEFAULT_FALLBACK_IMAGE;
}

/**
 * Получить оптимальный URL фотографии для отображения товара:
 * приоритетно берет фото из 1С, если оно валидно, иначе подходящую fallback-фотографию.
 */
export function getProductImage(identifier = '', name = '', raw1cImage?: string): string {
  if (raw1cImage && !raw1cImage.includes('image-unavailable.svg')) {
    return raw1cImage;
  }
  return getProductFallbackImage(identifier, name);
}

/**
 * Форматирует цену товара из любого текстового представления (от LLM или 1С)
 * в чистый вид: "52 500 ₽".
 */
export function formatChatPrice(priceInput?: string | number | null): string {
  if (priceInput === undefined || priceInput === null) return '';

  if (typeof priceInput === 'number') {
    if (isNaN(priceInput) || priceInput <= 0) return '';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(priceInput);
  }

  const str = String(priceInput).trim();
  if (!str) return '';

  // Очищаем копейки ",00" или ".00"
  const cleanedDecimals = str.replace(/[.,]00(?=\D*$)/, '');

  // Извлекаем только цифры
  const digits = cleanedDecimals.replace(/\D/g, '');
  if (digits) {
    const num = parseInt(digits, 10);
    if (!isNaN(num) && num > 0) {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
      }).format(num);
    }
  }

  // Если спарсить не удалось — возвращаем очищенную строку
  return str.replace(/[).,]+$/, '').trim();
}
