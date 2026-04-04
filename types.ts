export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory: string;
  type: string;
  brand: string;
  price: number;
  oldPrice?: number;
  description: string;
  shortDescription: string;
  imageUrl: string;
  images: string[];
  characteristics: Record<string, string>;
  sku: string;
}

export interface CartItem extends Product {
  quantity: number;
}
