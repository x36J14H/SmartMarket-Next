export interface Product {
  id: string;
  slug: string;
  name: string;
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
  description: string;
  shortDescription: string;
  imageUrl: string;
  images: string[];
  characteristics: Record<string, string>;
  sku: string;
  reviewsCount?: number;
  questionsCount?: number;
  rating?: number;
  isPurchased?: boolean;
  canReview?: boolean;
  hasReview?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}
