// Типы данных из 1С:Предприятие

export interface ApiProduct {
  id: string;
  name: string;
  article: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string;
  categorySlug: string;
  subcategory: string;
  subcategorySlug: string;
  type: string;
  typeSlug: string;
  brand: string;
  brandSlug: string;
  price: number;
  oldPrice?: number;
  inStock: number;
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
  total: number;
  page: number;
  limit: number;
}

export interface CatalogParams {
  category?: string;
  brand?: string | string[];
  q?: string;
  slug?: string;
  page?: number;
  limit?: number;
}

export interface ApiCategoriesResponse {
  categories: ApiCategory[];
}
