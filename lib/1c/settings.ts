// Сервисный слой для публичных настроек магазина и расчета доставки из 1С
// Запросы идут через /api/1c/settings и /api/1c/delivery/calculate

export interface StoreSettings {
  city: string;
  address: string;
  phone: string;
  email: string;
  workingHours: string;
  courierBaseTariff: number;
  postalCode?: string;
  hasDadataToken: boolean;
}

export interface DeliveryOption {
  id: string;          // 'pickup' | 'courier' | 'post_parcel' | 'post_courier'
  title: string;
  description: string;
  cost: number;
  days: string;
  available: boolean;
}

export interface DeliveryCalculationResponse {
  storeCity: string;
  customerCity: string;
  options: DeliveryOption[];
}

export interface DeliveryCalculationRequest {
  city?: string;
  address?: string;
  postalCode?: string;
  cartTotal?: number;
  weightGrams?: number;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  city: 'Москва',
  address: 'ул. Примерная, д. 10',
  phone: '8 (800) 555-35-35',
  email: 'support@smartmarket.ru',
  workingHours: 'Пн-Вс: 09:00 - 21:00',
  courierBaseTariff: 149,
  postalCode: '101000',
  hasDadataToken: false,
};

let cachedSettings: StoreSettings | null = null;

export const settingsService = {
  getSettings: async (signal?: AbortSignal): Promise<StoreSettings> => {
    try {
      const res = await fetch('/api/1c/settings', {
        headers: { 'Content-Type': 'application/json' },
        signal: signal ?? AbortSignal.timeout(8000),
      });
      if (!res.ok) {
        return cachedSettings || DEFAULT_STORE_SETTINGS;
      }
      const data = await res.json();
      const settings: StoreSettings = {
        city: data?.city || DEFAULT_STORE_SETTINGS.city,
        address: data?.address || DEFAULT_STORE_SETTINGS.address,
        phone: data?.phone || DEFAULT_STORE_SETTINGS.phone,
        email: data?.email || DEFAULT_STORE_SETTINGS.email,
        workingHours: data?.workingHours || DEFAULT_STORE_SETTINGS.workingHours,
        courierBaseTariff: typeof data?.courierBaseTariff === 'number' ? data.courierBaseTariff : DEFAULT_STORE_SETTINGS.courierBaseTariff,
        postalCode: data?.postalCode || DEFAULT_STORE_SETTINGS.postalCode,
        hasDadataToken: Boolean(data?.hasDadataToken),
      };
      cachedSettings = settings;
      return settings;
    } catch {
      return cachedSettings || DEFAULT_STORE_SETTINGS;
    }
  },

  calculateDelivery: async (
    payload: DeliveryCalculationRequest,
    signal?: AbortSignal
  ): Promise<DeliveryCalculationResponse> => {
    try {
      const res = await fetch('/api/1c/delivery/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: signal ?? AbortSignal.timeout(10000),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.options)) {
          if (data.storeCity && cachedSettings) {
            cachedSettings.city = data.storeCity;
          }
          return data as DeliveryCalculationResponse;
        }
      }
    } catch {
      // Игнорируем ошибку и возвращаем надежный fallback
    }

    // Fallback расчет на клиенте если 1С временно недоступен
    const storeCity = cachedSettings?.city || DEFAULT_STORE_SETTINGS.city;
    const storeAddress = cachedSettings?.address || DEFAULT_STORE_SETTINGS.address;
    const courierTariff = cachedSettings?.courierBaseTariff ?? DEFAULT_STORE_SETTINGS.courierBaseTariff;
    const customerCity = payload.city?.trim() || storeCity;
    const isSameCity = customerCity.toLowerCase() === storeCity.toLowerCase();

    return {
      storeCity,
      customerCity,
      options: [
        {
          id: 'pickup',
          title: 'Самовывоз из магазина',
          description: `г. ${storeCity}, ${storeAddress}`,
          cost: 0,
          days: 'Сегодня',
          available: true,
        },
        {
          id: 'courier',
          title: 'Курьер магазина',
          description: isSameCity
            ? `Доставка курьером до двери в г. ${storeCity}`
            : `Доступна только в г. ${storeCity}`,
          cost: courierTariff,
          days: isSameCity ? '1-2 дня' : '—',
          available: isSameCity,
        },
        {
          id: 'post_parcel',
          title: 'Почта России (В отделение)',
          description: 'Доставка в ближайшее почтовое отделение',
          cost: isSameCity ? 199 : 289,
          days: isSameCity ? '1-3 дня' : '3-6 дней',
          available: true,
        },
        {
          id: 'post_courier',
          title: 'Почта России (Курьер EMS)',
          description: 'Курьер Почты России до двери',
          cost: isSameCity ? 349 : 499,
          days: isSameCity ? '1-2 дня' : '2-5 дней',
          available: true,
        },
      ],
    };
  },
};
