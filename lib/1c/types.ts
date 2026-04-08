// Типы данных из 1С:Предприятие

export interface ApiProduct {
  id: string;
  name: string;
  article: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string;       // ВидНоменклатуры.Родитель.Наименование
  subcategory: string;    // ВидНоменклатуры.Наименование
  type: string;
  brand: string;
  price: number;
  oldPrice?: number;
  imageUrl: string;
  images: string[];
  characteristics: Record<string, string>;
}

export interface ApiCategory {
  name: string;
  slug: string;
  subcategories: {
    name: string;
    slug: string;
    types: { name: string; slug: string }[];
  }[];
}

export interface ApiCatalogResponse {
  items: ApiProduct[];
}

export interface ApiCategoriesResponse {
  categories: ApiCategory[];
}
