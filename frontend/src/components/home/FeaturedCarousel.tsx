'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight, FiStar, FiShoppingCart } from 'react-icons/fi';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/lib/store';
import type { Product } from '@/types';

interface Props {
  products: Product[];
}

export default function FeaturedCarousel({ products }: Props) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  const goTo = useCallback((index: number, dir: 'left' | 'right' = 'left') => {
    if (animating || products.length === 0) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 350);
  }, [animating, products.length]);

  const next = useCallback(() => {
    goTo((current + 1) % products.length, 'left');
  }, [current, products.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + products.length) % products.length, 'right');
  }, [current, products.length, goTo]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 4500);
  }, [next]);

  useEffect(() => {
    if (products.length <= 1) return;
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [products.length, resetTimer]);

  if (products.length === 0) return null;

  const p = products[current];
  const image = p.images?.find((i) => i.is_primary)?.url || p.images?.[0]?.url || '';
  const discount = p.sale_price ? Math.round((1 - p.sale_price / p.price) * 100) : 0;

  const handleAddToCart = () => {
    addItem(p);
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-primary-900 to-slate-800 shadow-xl"
      onMouseEnter={() => { if (timerRef.current) clearInterval(timerRef.current); }}
      onMouseLeave={resetTimer}
    >
      {/* Background glow */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
      </div>

      <div
        className="relative grid grid-cols-1 md:grid-cols-2 gap-6 p-6 md:p-10 min-h-[320px] md:min-h-[400px] transition-all"
        style={{
          opacity: animating ? 0 : 1,
          transform: animating
            ? `translateX(${direction === 'left' ? '-30px' : '30px'})`
            : 'translateX(0)',
          transition: 'opacity 0.35s ease, transform 0.35s ease',
        }}
      >
        {/* Content */}
        <div className="flex flex-col justify-center gap-4 order-2 md:order-1">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 bg-yellow-400/20 text-yellow-300 text-xs font-bold px-3 py-1 rounded-full border border-yellow-400/30">
              <FiStar size={11} fill="currentColor" /> مميز
            </span>
            {discount > 0 && (
              <span className="bg-red-500/90 text-white text-xs font-bold px-3 py-1 rounded-full">
                خصم {discount}%
              </span>
            )}
            {p.category && (
              <span className="bg-white/10 text-white/70 text-xs px-3 py-1 rounded-full">
                {p.category.name_ar}
              </span>
            )}
          </div>

          {/* Name */}
          <h3 className="text-xl md:text-3xl font-extrabold text-white leading-snug line-clamp-2">
            {p.name_ar}
          </h3>

          {/* Description */}
          {p.description_ar && (
            <p className="text-white/60 text-sm line-clamp-2">{p.description_ar}</p>
          )}

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="text-2xl md:text-3xl font-extrabold text-white">
              {formatPrice(p.sale_price ?? p.price)}
            </span>
            {p.sale_price && (
              <span className="text-white/40 line-through text-base mb-0.5">
                {formatPrice(p.price)}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-2 bg-white text-primary-800 font-bold px-5 py-2.5 rounded-xl hover:bg-primary-50 transition-colors text-sm shadow-md"
            >
              <FiShoppingCart size={16} />
              أضف للسلة
            </button>
            <Link
              href={`/products/${p.id}`}
              className="flex items-center gap-2 border border-white/30 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-sm"
            >
              عرض التفاصيل
            </Link>
          </div>
        </div>

        {/* Image */}
        <div className="flex items-center justify-center order-1 md:order-2">
          <div className="relative w-full max-w-[280px] md:max-w-[360px] aspect-square">
            {image ? (
              <img
                src={image}
                alt={p.name_ar}
                className="w-full h-full object-contain drop-shadow-2xl"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/20 text-6xl">📦</div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {products.length > 1 && (
        <>
          <button
            onClick={() => { prev(); resetTimer(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors backdrop-blur-sm border border-white/20"
            aria-label="السابق"
          >
            <FiChevronRight size={18} />
          </button>
          <button
            onClick={() => { next(); resetTimer(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors backdrop-blur-sm border border-white/20"
            aria-label="التالي"
          >
            <FiChevronLeft size={18} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {products.map((_, i) => (
              <button
                key={i}
                onClick={() => { goTo(i, i > current ? 'left' : 'right'); resetTimer(); }}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-6 h-2 bg-white'
                    : 'w-2 h-2 bg-white/30 hover:bg-white/60'
                }`}
                aria-label={`الانتقال إلى المنتج ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Product counter */}
      {products.length > 1 && (
        <div className="absolute top-4 left-4 bg-black/30 text-white/70 text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
          {current + 1} / {products.length}
        </div>
      )}
    </div>
  );
}
