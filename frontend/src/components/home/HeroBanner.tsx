'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiShield, FiTruck, FiPhone, FiRefreshCw, FiChevronLeft, FiChevronRight, FiShoppingCart } from 'react-icons/fi';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/lib/store';
import type { Product } from '@/types';

const features = [
  { icon: FiTruck, title: 'توصيل لكل سوريا', desc: 'نوصل لجميع المحافظات' },
  { icon: FiShield, title: 'ضمان الجودة', desc: 'منتجات أصلية مع ضمان' },
  { icon: FiPhone, title: 'دعم 7/24', desc: 'فريق دعم متاح دائماً' },
  { icon: FiRefreshCw, title: 'سهولة الإرجاع', desc: 'إرجاع خلال 14 يوم' },
];

const FeaturesBar = () => (
  <div className="bg-white border-b border-slate-200">
    <div className="container-main">
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-x-reverse divide-slate-200">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-center gap-3 py-4 px-4">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
              <Icon size={18} className="text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{title}</p>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function HeroBanner() {
  const [heroProducts, setHeroProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [dir, setDir] = useState<'left' | 'right'>('left');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    fetch('/api/products?tag=hero_banner&limit=10')
      .then((r) => r.json())
      .then((d) => { if (d.success) setHeroProducts(d.data || []); })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const goTo = useCallback((index: number, direction: 'left' | 'right' = 'left') => {
    if (animating) return;
    setDir(direction);
    setAnimating(true);
    setTimeout(() => { setCurrent(index); setAnimating(false); }, 380);
  }, [animating]);

  const next = useCallback(() => {
    if (heroProducts.length <= 1) return;
    goTo((current + 1) % heroProducts.length, 'left');
  }, [current, heroProducts.length, goTo]);

  const prev = useCallback(() => {
    if (heroProducts.length <= 1) return;
    goTo((current - 1 + heroProducts.length) % heroProducts.length, 'right');
  }, [current, heroProducts.length, goTo]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (heroProducts.length > 1) timerRef.current = setInterval(next, 5000);
  }, [next, heroProducts.length]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  // ─── Dynamic hero (products pinned from admin) ────────────────────────────
  if (loaded && heroProducts.length > 0) {
    const p = heroProducts[current];
    const image = p.images?.find((i) => i.is_primary)?.url || p.images?.[0]?.url || '';
    const discount = p.sale_price ? Math.round((1 - p.sale_price / p.price) * 100) : 0;

    return (
      <section>
        <div
          className="bg-gradient-to-l from-primary-700 to-primary-900 text-white relative overflow-hidden"
          onMouseEnter={() => { if (timerRef.current) clearInterval(timerRef.current); }}
          onMouseLeave={resetTimer}
        >
          {/* Glow */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-300 rounded-full blur-3xl" />
          </div>

          <div
            className="container-main py-12 md:py-20 relative"
            style={{
              opacity: animating ? 0 : 1,
              transform: animating ? `translateX(${dir === 'left' ? '-24px' : '24px'})` : 'translateX(0)',
              transition: 'opacity 0.38s ease, transform 0.38s ease',
            }}
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Text */}
              <div className="flex-1 text-center md:text-right order-2 md:order-1">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-3 flex-wrap">
                  {discount > 0 && (
                    <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">خصم {discount}%</span>
                  )}
                  {p.category && (
                    <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">{p.category.name_ar}</span>
                  )}
                  {p.brand && (
                    <span className="bg-white/10 text-white/80 text-xs px-3 py-1 rounded-full">{p.brand}</span>
                  )}
                </div>
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-3 line-clamp-2">
                  {p.name_ar}
                </h1>
                {p.description_ar && (
                  <p className="text-white/60 text-sm mb-5 max-w-md line-clamp-2">{p.description_ar}</p>
                )}
                <div className="flex items-end gap-3 justify-center md:justify-start mb-6">
                  <span className="text-2xl md:text-3xl font-extrabold">{formatPrice(p.sale_price ?? p.price)}</span>
                  {p.sale_price && (
                    <span className="text-white/40 line-through text-base mb-0.5">{formatPrice(p.price)}</span>
                  )}
                </div>
                <div className="flex gap-3 justify-center md:justify-start">
                  <Link href={`/products/${p.id}`} className="btn-accent flex items-center gap-2">
                    عرض المنتج <FiArrowLeft size={16} className="icon-flip" />
                  </Link>
                  <button
                    onClick={() => addItem(p)}
                    className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors flex items-center gap-2 text-sm"
                  >
                    <FiShoppingCart size={16} /> أضف للسلة
                  </button>
                </div>
              </div>

              {/* Image */}
              <div className="flex-1 flex justify-center order-1 md:order-2">
                <div className="w-64 h-52 md:w-96 md:h-72">
                  {image ? (
                    <img
                      src={image}
                      alt={p.name_ar}
                      className="w-full h-full object-contain drop-shadow-2xl"
                      onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                    />
                  ) : (
                    <div className="w-full h-full bg-white/10 rounded-2xl flex items-center justify-center text-6xl">💻</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Nav arrows */}
          {heroProducts.length > 1 && (
            <>
              <button onClick={() => { prev(); resetTimer(); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white border border-white/20 transition-colors">
                <FiChevronRight size={18} />
              </button>
              <button onClick={() => { next(); resetTimer(); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white border border-white/20 transition-colors">
                <FiChevronLeft size={18} />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                {heroProducts.map((_, i) => (
                  <button key={i} onClick={() => { goTo(i, i > current ? 'left' : 'right'); resetTimer(); }}
                    className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/30 hover:bg-white/60'}`} />
                ))}
              </div>
              <div className="absolute top-3 left-4 bg-black/25 text-white/70 text-xs px-2 py-0.5 rounded-full">
                {current + 1} / {heroProducts.length}
              </div>
            </>
          )}
        </div>
        <FeaturesBar />
      </section>
    );
  }

  // ─── Static fallback ──────────────────────────────────────────────────────
  return (
    <section>
      <div className="bg-gradient-to-l from-primary-700 to-primary-900 text-white">
        <div className="container-main py-14 md:py-20">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-right">
              <span className="inline-block bg-accent text-white text-xs font-bold px-3 py-1 rounded-full mb-4">خصم حتى 20%</span>
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-3">أقوى اللابتوبات</h1>
              <p className="text-xl text-white/80 mb-2">بأسعار تنافسية في سوريا</p>
              <p className="text-white/60 text-sm mb-8 max-w-md">لابتوبات جيمينج، عمل، ودراسة من أفضل الماركات العالمية</p>
              <div className="flex gap-3 justify-center md:justify-start">
                <Link href="/products?category=laptops" className="btn-accent flex items-center gap-2">
                  تسوق الآن <FiArrowLeft size={16} className="icon-flip" />
                </Link>
                <Link href="/products" className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors">
                  جميع المنتجات
                </Link>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="w-72 h-60 md:w-96 md:h-72 bg-white/10 rounded-2xl flex items-center justify-center">
                <div className="text-center text-white/40">
                  <div className="text-6xl mb-2">💻</div>
                  <p className="text-sm">لم يتم اختيار منتج للبانر</p>
                  <p className="text-xs mt-1 opacity-60">من لوحة التحكم ← المنتجات ← أيقونة البانر 🖼</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FeaturesBar />
    </section>
  );
}
