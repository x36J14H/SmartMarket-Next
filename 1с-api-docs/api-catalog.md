# Catalog API

Base URL: `http://<host>:<port>/smartmarket/hs/site-api`

Авторизация: Basic Auth (логин/пароль пользователя 1С).  
Все ответы: `Content-Type: application/json; charset=utf-8`.  
CORS: `Access-Control-Allow-Origin: *`.

---

## GET /catalog

Список товаров с фильтрацией и пагинацией.

### Query-параметры

| Параметр   | Тип    | По умолчанию | Описание |
|------------|--------|:------------:|----------|
| `page`     | number | `1`          | Номер страницы (начиная с 1) |
| `limit`    | number | `20`         | Записей на странице (макс. 100) |
| `category` | string | —            | Slug категории (любой уровень иерархии) |
| `brand`    | string | —            | Slug бренда (точное совпадение по Slug) |
| `q`        | string | —            | Поиск по наименованию и артикулу (подстрока) |

> Для поиска по slug используй `GET /catalog/slug/{slug}`.

### Ответ `200`

```json
{
  "items": [
    {
      "id": "fe0a06db-288a-11f1-8d5c-4c2338935cb2",
      "name": "iPhone 15 Pro",
      "article": "IPH15PRO",
      "slug": "iphone-15-pro",
      "description": "Описание товара",
      "type": "Смартфон",
      "typeSlug": "smartfon",
      "category": "Электроника",
      "categorySlug": "elektronika",
      "subcategory": "Телефоны",
      "subcategorySlug": "telefony",
      "brand": "Apple",
      "price": 89990.00,
      "imageUrl": "5b270d7e-2922-11f1-8d5d-4c2338935cb2",
      "images": []
    }
  ],
  "total": 142,
  "page": 1,
  "limit": 20
}
```

### Поля товара в списке

| Поле              | Тип    | Описание |
|-------------------|--------|----------|
| `id`              | string | UUID товара |
| `name`            | string | Наименование |
| `article`         | string | Артикул |
| `slug`            | string | URL-slug (или артикул, или UUID если не задан) |
| `description`     | string | Описание |
| `type`            | string | Вид номенклатуры (листовой уровень) |
| `typeSlug`        | string | Slug вида номенклатуры |
| `category`        | string | Категория (корневой уровень) |
| `categorySlug`    | string | Slug категории |
| `subcategory`     | string | Подкатегория (второй уровень) |
| `subcategorySlug` | string | Slug подкатегории |
| `brand`           | string | Бренд |
| `brandSlug`       | string | Slug бренда |
| `price`           | number | Актуальная цена (0 если не задана) |
| `inStock`         | number | Количество на складе (только товары с остатками > 0) |
| `imageUrl`        | string | fileId главного изображения (UUID) |
| `images`          | array  | Пустой массив в списке (все фото только в карточке) |

---

## GET /catalog/{id}

Карточка товара по UUID.

### Path-параметры

| Параметр | Тип    | Описание |
|----------|--------|----------|
| `id`     | string | UUID товара |

### Ответ `200`

```json
{
  "id": "fe0a06db-288a-11f1-8d5c-4c2338935cb2",
  "name": "iPhone 15 Pro",
  "article": "IPH15PRO",
  "slug": "iphone-15-pro",
  "description": "Описание товара",
  "type": "Смартфон",
  "typeSlug": "smartfon",
  "category": "Электроника",
  "categorySlug": "elektronika",
  "subcategory": "Телефоны",
  "subcategorySlug": "telefony",
  "brand": "Apple",
  "price": 89990.00,
  "inStock": 15,
  "imageUrl": "5b270d7e-2922-11f1-8d5d-4c2338935cb2",
  "images": [
    "5b270d7e-2922-11f1-8d5d-4c2338935cb2",
    "6c381e8f-3033-22g2-9e6e-5d3449046dc3"
  ],
  "characteristics": {
    "Цвет": "Чёрный титан",
    "Память": "256 ГБ",
    "Диагональ экрана": "6.1\""
  }
}
```

### Отличия от списка

| Поле              | В списке | В карточке |
|-------------------|:--------:|:----------:|
| `images`          | `[]`     | Все фото   |
| `characteristics` | `{}`     | Заполнен   |
| `inStock`         | число    | число (0 если нет в наличии) |

### Ответ `404`

```json
{ "error": "Товар не найден" }
```

---

## GET /catalog/slug/{slug}

Карточка товара по slug. Возвращает товар даже если нет в наличии (`inStock = 0`).

### Path-параметры

| Параметр | Тип    | Описание |
|----------|--------|----------|
| `slug`   | string | Slug товара |

### Ответ `200`

Аналогичен `GET /catalog/{id}` — полная карточка с `inStock`, `images`, `characteristics`.

### Ответ `404`

```json
{ "error": "Товар не найден" }
```

---

## GET /catalog/{id}/images/{fileId}

Бинарный файл изображения товара.

### Path-параметры

| Параметр | Тип    | Описание |
|----------|--------|----------|
| `id`     | string | UUID товара |
| `fileId` | string | UUID файла изображения (из поля `images` карточки) |

### Ответ `200`

Бинарные данные изображения.

| Заголовок       | Значение |
|-----------------|----------|
| `Content-Type`  | `image/jpeg`, `image/png`, `image/webp` и др. |
| `Cache-Control` | `public, max-age=86400` |

### Ответ `404`

Пустое тело — файл не найден или невалидный UUID.

### Использование на фронте

```js
// fileId берётся из поля images[] карточки товара
const imageUrl = `${BASE_URL}/catalog/${productId}/images/${fileId}`;
// Используется напрямую в <img src="...">
```

---

## GET /brands

Список всех брендов из справочника.

### Ответ `200`

```json
[
  { "name": "Apple", "slug": "apple" },
  { "name": "Xiaomi", "slug": "xiaomi" }
]
```

---

## GET /categories

Дерево категорий (3 уровня иерархии).

### Ответ `200`

```json
{
  "categories": [
    {
      "name": "Электроника",
      "slug": "elektronika",
      "subcategories": [
        {
          "name": "Телефоны",
          "slug": "telefony",
          "types": [
            { "name": "Смартфон", "slug": "smartfon" },
            { "name": "Кнопочный телефон", "slug": "knopochnyj-telefon" }
          ]
        }
      ]
    }
  ]
}
```

### Структура дерева

```
categories[]
  └── name, slug
  └── subcategories[]
        └── name, slug
        └── types[]
              └── name, slug
```

Slug из `types[].slug` используется как параметр `?category=` в `/catalog`.

---

## Коды ответов

| Код | Описание |
|-----|----------|
| `200` | Успех |
| `404` | Ресурс не найден |

---

## Примеры запросов

```
# Первая страница каталога
GET /catalog?page=1&limit=20

# Фильтр по категории
GET /catalog?category=smartfon

# Фильтр по бренду (slug)
GET /catalog?brand=apple

# Список брендов
GET /brands

# Поиск
GET /catalog?q=iphone

# Комбинация
GET /catalog?category=smartfon&brand=Apple&q=pro&page=1&limit=10

# Карточка товара по ID
GET /catalog/fe0a06db-288a-11f1-8d5c-4c2338935cb2

# Карточка товара по slug
GET /catalog/slug/iphone-15-pro

# Изображение
GET /catalog/fe0a06db-288a-11f1-8d5c-4c2338935cb2/images/5b270d7e-2922-11f1-8d5d-4c2338935cb2

# Дерево категорий
GET /categories
```
