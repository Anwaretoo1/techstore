import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = '$'): string {
  return `${price.toLocaleString('en-US')} ${currency}`;
}

export function calcDiscount(original: number, sale: number): number {
  return Math.round(((original - sale) / original) * 100);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending:    'قيد الانتظار',
  processing: 'قيد المعالجة',
  shipped:    'تم الشحن',
  delivered:  'تم التسليم',
  cancelled:  'ملغي',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash_on_delivery: 'الدفع عند الاستلام',
  syriatel_cash:    'سيريتل كاش',
  mtn_cash:         'MTN كاش',
  sham_cash:        'شام كاش',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending:  'قيد الانتظار',
  paid:     'مدفوع',
  failed:   'فشل الدفع',
  refunded: 'مسترجع',
};

export const CITIES = [
  'دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية',
  'طرطوس', 'دير الزور', 'الرقة', 'درعا', 'السويداء',
  'القنيطرة', 'إدلب', 'الحسكة',
];
