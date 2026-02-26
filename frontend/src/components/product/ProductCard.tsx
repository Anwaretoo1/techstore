'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FiShoppingCart, FiStar, FiHeart } from 'react-icons/fi';
import { useCartStore } from '@/lib/store';
import { formatPrice, calcDiscount } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import type { Product } from '@/types';

interface Props { product: Product; }

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const image = product.images.find((i) => i.is_primary)?.url || product.images[0]?.url || '/images/placeholder.png';
  const price = product.sale_price ?? product.price;
  const hasDiscount = product.sale_price !== null && product.sale_price < product.price;
  const discount = hasDiscount ? calcDiscount(product.price, product.sale_price!) : 0;
  const inStock = product.stock > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!inStock) return;
    addItem(product);
    toast.success('تمت الإضافة إلى السلة');
  };

  return (
    <Link href={`/products/${product.id}`} className="product-card block">
      {/* Image */}
      <div className="relative aspect-square bg-slate-50 overflow-hidden flex items-center justify-center">
        <img
          src={image}
          alt={product.name_ar}
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300 w-full h-full"
        />

        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {hasDiscount && (
            <span className="price-sale-badge">{discount}% خصم</span>
          )}
          {product.is_featured && (
            <span className="badge bg-primary-600 text-white">مميز</span>
          )}
          {!inStock && (
            <span className="badge bg-slate-700 text-white">نفذ</span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => { e.preventDefault(); toast('قريباً: قائمة الرغبات'); }}
          className="absolute top-2 left-2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200"
        >
          <FiHeart size={15} />
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        {/* Category */}
        <p className="text-xs text-slate-400 mb-1">{product.category?.name_ar}</p>

        {/* Name */}
        <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-relaxed mb-2">
          {product.name_ar}
        </h3>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <FiStar
                  key={i}
                  size={12}
                  className={i < Math.round(product.rating) ? 'fill-current' : 'text-slate-300'}
                />
              ))}
            </div>
            <span className="text-xs text-slate-400">({product.review_count})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="price-current">{formatPrice(price)}</span>
          {hasDiscount && (
            <span className="price-original">{formatPrice(product.price)}</span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className="btn-primary w-full text-sm flex items-center justify-center gap-2 py-2"
        >
          <FiShoppingCart size={15} />
          {inStock ? 'أضف إلى السلة' : 'نفذت الكمية'}
        </button>
      </div>
    </Link>
  );
}
