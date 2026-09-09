/**
 * Утилиты для разрешения изображений товаров и чистого форматирования цен.
 */

const DEFAULT_FALLBACK_IMAGE = '/service/image-unavailable.svg';

/**
 * Возвращает стандартную заглушку при отсутствии фотографии товара в 1С.
 */
export function getProductFallbackImage(_identifier = '', _name = ''): string {
  return DEFAULT_FALLBACK_IMAGE;
}

/**
 * Санитизирует URL фотографии товара:
 * - устраняет дублирование пути вида /api/1c/catalog/.../images//api/1c/...
 * - преобразует сырой fileId в /api/1c/catalog/:productId/images/:fileId
 * - при отсутствии изображения подставляет fallback
 */
export function sanitizeProductImageUrl(
  productId: string,
  slug = '',
  name = '',
  rawUrl?: string | null
): string {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return getProductFallbackImage(slug || productId, name);
  }

  let cleaned = rawUrl.trim();
  if (!cleaned || cleaned.includes('image-unavailable.svg')) {
    return getProductFallbackImage(slug || productId, name);
  }

  // Если URL был ошибочно склеен/продублирован
  const lastApiIndex = cleaned.lastIndexOf('/api/1c/catalog/');
  if (lastApiIndex > 0) {
    cleaned = cleaned.substring(lastApiIndex);
  }

  // Если это не абсолютный URL и не локальный путь, считаем это сырым fileId
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://') && !cleaned.startsWith('/')) {
    cleaned = `/api/1c/catalog/${productId}/images/${cleaned}`;
  }

  return cleaned;
}

/**
 * Получить оптимальный URL фотографии для отображения товара:
 * приоритетно берет фото из 1С, если оно валидно, иначе подходящую fallback-фотографию.
 */
export function getProductImage(identifier = '', name = '', raw1cImage?: string): string {
  if (raw1cImage && !raw1cImage.includes('image-unavailable.svg')) {
    return sanitizeProductImageUrl(identifier, identifier, name, raw1cImage);
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
