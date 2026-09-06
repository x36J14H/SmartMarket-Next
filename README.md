# SmartMarket Frontend (`smartmarket-next`) 🛒✨

Современный фронтенд интернет-магазина на **Next.js 16 (App Router)** с прямой интеграцией с **1С:Предприятие 8.3** и **FastAPI AI Service**.

---

## ⚡ Особенности и функциональность

- **Каталог и поиск товаров**:
  - Быстрый каталог с фильтрацией по категориям, брендам и характеристикам.
  - **Умный семантический AI-поиск** (`/search?ai=1`): ищет товары по смыслу и синонимам («мобила», «дешёвый телефон для бабушки», «подарок для фотографа»), используя векторные эмбеддинги.
  - Автоматический fallback на прямой текстовый поиск по каталогу 1С при недоступности AI-сервиса.
  - Пакетная загрузка карточек товаров (`POST /catalog/by-ids`) для минимизации сетевых запросов.
- **Корзина и Избранное**:
  - Поддержка как авторизованных покупателей, так и гостевых пользователей (сохранение состояния в `localStorage` через Zustand persist).
  - Автоматическое слияние (`mergeToServer`) локальной корзины и избранного с аккаунтом 1С при входе пользователя.
  - Онлайн-проверка остатков и актуальных цен (`/catalog/availability`).
- **Оформление заказа и Личный кабинет**:
  - Пошаговый чекаут с подсказками адреса через **DaData ФИАС**.
  - История заказов, отслеживание статусов (Новый, В обработке, Собран, Отправлен, Выполнен), онлайн-резервирование товаров на складе 1С.
  - Управление контактными данными и адресами доставки.
- **Интерактивный ИИ-Консультант**:
  - Встроенный виджет AI-чата с поддержкой стриминга и контекстных рекомендаций товаров.
- **PWA и адаптивный дизайн**:
  - Поддержка мобильных устройств, планшетов и десктопов, плавная анимация (Motion/React), Service Worker.

---

## 🛠 Технологический стек

- **Фреймворк**: Next.js 16 (App Router, Turbopack / Webpack)
- **Библиотека UI**: React 19, Tailwind CSS v4, Lucide Icons, Motion (Framer Motion)
- **Управление состоянием**: Zustand (с middleware `persist`)
- **Уведомления**: React Hot Toast
- **Интеграция с бэкендом**:
  - Прокси-роуты Next.js (`/api/1c/*`, `/api/auth/*`, `/api/orders/*`, `/api/personal/*`) для безопасной связи с 1С без раскрытия учётных данных;
  - Запросы к FastApi AI Service (`/api/ai-search`, `/api/ai-chat`).

---

## 🚀 Запуск и сборка

### Установка зависимостей:
```bash
npm install
```

### Запуск в режиме разработки:
```bash
npm run dev
```
Приложение доступно по адресу `http://localhost:3000`.

### Сборка и запуск продакшен-версии:
```bash
npm run build
npm run start
```

---

## ⚙️ Переменные окружения (`.env.local`)

```env
# 1С backend HTTP-сервисы (Apache)
ONEC_BASE_URL=http://localhost:8081/smartmarket/hs/site-api
ONEC_AUTH_URL=http://localhost:8081/smartmarket/hs/site-auth
ONEC_PERSONAL_URL=http://localhost:8081/smartmarket/hs/personal
ONEC_USERNAME=Администратор
ONEC_PASSWORD=

# FastAPI AI-сервис
AI_SERVICE_URL=http://localhost:8000

# DaData API (подсказки адресов)
DADATA_API_KEY=your_api_key_here
```

---

## 📁 Структура проекта

```
smartmarket-next/
├── app/
│   ├── (site)/             # Страницы магазина (catalog, product, cart, checkout, profile, favorites, search...)
│   ├── api/                # Next.js Route Handlers (прокси к 1C, auth, ai-search, ai-chat)
│   ├── layout.tsx          # Корневой лейаут с провайдерами
│   └── globals.css         # Стили Tailwind
├── components/             # Реакт-компоненты (Header, Footer, ProductCard, AuthModal, AIChatbot...)
├── lib/
│   ├── 1c/                 # Клиенты и сервисы интеграции с 1С (catalog, auth, orders, personal)
│   └── utils.ts            # Утилиты форматирования цен, дат и классов
├── store/                  # Zustand-сторы (authStore, cartStore, favoritesStore)
├── types/                  # TypeScript типы моделей данных
└── public/                 # Статические ассеты, иконки, PWA манифест
```
