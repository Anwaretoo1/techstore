// ─── Product Types ─────────────────────────────────────────────────────────
export interface Product {
  id: number;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  price: number;
  sale_price: number | null;
  sku: string;
  stock: number;
  category_id: number;
  category?: Category;
  images: ProductImage[];
  specifications: Specification[];
  tags: string[];
  brand: string;
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

export interface ProductImage {
  id: number;
  url: string;
  alt: string;
  is_primary: boolean;
}

export interface Specification {
  key: string;
  key_ar: string;
  value: string;
  value_ar: string;
}

// ─── Category Types ─────────────────────────────────────────────────────────
export interface Category {
  id: number;
  name: string;
  name_ar: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: number | null;
  children?: Category[];
  product_count?: number;
}

// ─── Cart Types ──────────────────────────────────────────────────────────────
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// ─── User Types ──────────────────────────────────────────────────────────────
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'customer' | 'admin';
  addresses: Address[];
  created_at: string;
}

export interface Address {
  id: number;
  label: string;
  full_name: string;
  phone: string;
  city: string;
  area: string;
  street: string;
  notes?: string;
  is_default: boolean;
}

// ─── Order Types ─────────────────────────────────────────────────────────────
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cash_on_delivery' | 'syriatel_cash' | 'mtn_cash' | 'sham_cash';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  user?: User;
  items: OrderItem[];
  shipping_address: Address;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  notes?: string;
  coupon_code?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product?: Product;
  product_name: string;
  product_name_ar: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// ─── API Response Types ───────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// ─── Filter Types ─────────────────────────────────────────────────────────────
export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  page?: number;
  limit?: number;
}
