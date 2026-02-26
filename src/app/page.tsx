'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiMonitor, FiCpu, FiHardDrive, FiHeadphones, FiMousePointer, FiPrinter
} from 'react-icons/fi';
import { productsApi, categoriesApi } from '@/lib/api';
import type { Product, Category } from '@/types';
import HeroBanner from '@/components/home/HeroBanner';
import ProductCard from '@/components/product/ProductCard';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  laptops:     FiMonitor,
  desktops:    FiCpu,
  storage:     FiHardDrive,
  accessories: FiHeadphones,
  mice:        FiMousePointer,
  printers:    FiPrinter,
};

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productsApi.getFeatured(),
      productsApi.getAll({ sort: 'newest', limit: 8 }),
      categoriesApi.getAll(),
    ]).then(([featRes, newRes, catRes]) => {
      setFeatured(featRes.data.data || []);
      setNewArrivals(newRes.data.data || []);
      setCategories(catRes.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const SkeletonCard = () => (
    <div className="card p-3 space-y-3">
      <div className="skeleton aspect-square rounded-lg" />
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-4 w-1/2 rounded" />
      <div className="skeleton h-9 rounded-lg" />
    </div>
  );

  return (
    <div>
      <HeroBanner />

      <div className="container-main py-12 space-y-14">
        {/* Categories */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">تصفح حسب الفئة</h2>
              <p className="section-subtitle">اختر من تشكيلتنا الواسعة</p>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {categories.slice(0, 6).map((cat) => {
              const Icon = CATEGORY_ICONS[cat.slug] || FiMonitor;
              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="card p-4 flex flex-col items-center gap-2 text-center hover:border-primary-300 hover:bg-primary-50 transition-all group"
                >
                  <div className="w-12 h-12 bg-primary-50 group-hover:bg-primary-100 rounded-xl flex items-center justify-center transition-colors">
                    <Icon size={22} className="text-primary-600" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">{cat.name_ar}</span>
                  {cat.product_count !== undefined && (
                    <span className="text-[10px] text-slate-400">{cat.product_count} منتج</span>
                  )}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Featured Products */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">منتجات مميزة</h2>
              <p className="section-subtitle">أفضل اختياراتنا لك</p>
            </div>
            <Link href="/products?featured=true" className="btn-ghost text-sm text-primary-600">
              عرض الكل
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading
              ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : featured.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </section>

        {/* Promo Banner */}
        <section className="bg-gradient-to-l from-accent to-orange-600 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-extrabold mb-2">عروض حصرية هذا الأسبوع!</h3>
            <p className="text-white/80">خصومات تصل إلى 30% على معدات الجيمينج والإكسسوارات</p>
          </div>
          <Link href="/products?sale=true" className="bg-white text-accent font-bold px-8 py-3 rounded-xl hover:bg-orange-50 transition-colors shrink-0">
            تسوق العروض
          </Link>
        </section>

        {/* New Arrivals */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">أحدث الوصولات</h2>
              <p className="section-subtitle">أحدث المنتجات في متجرنا</p>
            </div>
            <Link href="/products?sort=newest" className="btn-ghost text-sm text-primary-600">
              عرض الكل
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading
              ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : newArrivals.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </section>

        {/* Brands */}
        <section className="text-center">
          <h2 className="section-title mb-2">ماركات نثق بها</h2>
          <p className="section-subtitle mb-8">نوفر أفضل العلامات التجارية العالمية</p>
          <div className="flex flex-wrap justify-center gap-6">
            {['ASUS', 'HP', 'Dell', 'Lenovo', 'MSI', 'Acer', 'Samsung', 'LG'].map((brand) => (
              <Link
                key={brand}
                href={`/products?brand=${brand}`}
                className="px-6 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold hover:border-primary-300 hover:text-primary-600 transition-all hover:bg-primary-50"
              >
                {brand}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
