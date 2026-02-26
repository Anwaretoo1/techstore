'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiFilter, FiGrid, FiList, FiChevronDown, FiX } from 'react-icons/fi';
import { productsApi, categoriesApi } from '@/lib/api';
import type { Product, Category, ProductFilters } from '@/types';
import ProductCard from '@/components/product/ProductCard';

const SORT_OPTIONS = [
  { value: 'newest',    label: 'الأحدث' },
  { value: 'popular',   label: 'الأكثر شعبية' },
  { value: 'price_asc', label: 'السعر: من الأقل' },
  { value: 'price_desc',label: 'السعر: من الأعلى' },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState<ProductFilters>({
    category: searchParams.get('category') || undefined,
    brand:    searchParams.get('brand')    || undefined,
    search:   searchParams.get('search')   || undefined,
    sort:     (searchParams.get('sort') as ProductFilters['sort']) || 'newest',
    minPrice: undefined,
    maxPrice: undefined,
    page: 1,
    limit: 12,
  });

  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsApi.getAll(filters as Record<string, unknown>);
      setProducts(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => {
    categoriesApi.getAll().then((r) => setCategories(r.data.data || []));
  }, []);

  const updateFilter = (key: keyof ProductFilters, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ sort: 'newest', page: 1, limit: 12 });
    setMinPriceInput('');
    setMaxPriceInput('');
  };

  const applyPriceFilter = () => {
    setFilters((prev) => ({
      ...prev,
      minPrice: minPriceInput ? Number(minPriceInput) : undefined,
      maxPrice: maxPriceInput ? Number(maxPriceInput) : undefined,
      page: 1,
    }));
  };

  const hasActiveFilters = filters.category || filters.brand || filters.minPrice || filters.maxPrice || filters.search;
  const pages = Math.ceil(total / (filters.limit || 12));

  const FilterSidebar = () => (
    <aside className="w-64 shrink-0">
      <div className="card p-4 sticky top-24 space-y-5">
        {hasActiveFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700">
            <FiX size={14} />مسح الفلاتر
          </button>
        )}

        {/* Categories */}
        <div>
          <h3 className="font-bold text-slate-800 mb-3 text-sm">الفئة</h3>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio" name="category" value=""
                checked={!filters.category}
                onChange={() => updateFilter('category', undefined)}
                className="accent-primary-600"
              />
              <span className="text-sm text-slate-700">جميع الفئات</span>
            </label>
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio" name="category" value={cat.slug}
                  checked={filters.category === cat.slug}
                  onChange={() => updateFilter('category', cat.slug)}
                  className="accent-primary-600"
                />
                <span className="text-sm text-slate-700">{cat.name_ar}</span>
                {cat.product_count !== undefined && (
                  <span className="text-xs text-slate-400 mr-auto">({cat.product_count})</span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h3 className="font-bold text-slate-800 mb-3 text-sm">نطاق السعر ($)</h3>
          <div className="flex gap-2 mb-2">
            <input
              type="number" placeholder="من" value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              className="input-field text-sm py-1.5"
            />
            <input
              type="number" placeholder="إلى" value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              className="input-field text-sm py-1.5"
            />
          </div>
          <button onClick={applyPriceFilter} className="btn-secondary w-full text-sm py-1.5">
            تطبيق
          </button>
        </div>

        {/* Brands */}
        <div>
          <h3 className="font-bold text-slate-800 mb-3 text-sm">الماركة</h3>
          <div className="space-y-1.5">
            {['ASUS', 'HP', 'Dell', 'Lenovo', 'MSI', 'Acer', 'Samsung', 'LG'].map((brand) => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio" name="brand" value={brand}
                  checked={filters.brand === brand}
                  onChange={() => updateFilter('brand', brand)}
                  className="accent-primary-600"
                />
                <span className="text-sm text-slate-700">{brand}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="container-main py-8">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          {filters.search ? `نتائج البحث: "${filters.search}"` : filters.category ? `فئة: ${categories.find(c => c.slug === filters.category)?.name_ar || filters.category}` : 'جميع المنتجات'}
        </h1>
        <p className="text-slate-500 text-sm mt-1">{total} منتج</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Desktop */}
        <div className="hidden lg:block">
          <FilterSidebar />
        </div>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4 gap-4">
            <button
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden btn-secondary flex items-center gap-2 text-sm"
            >
              <FiFilter size={15} />فلتر
            </button>

            <div className="flex items-center gap-2 mr-auto">
              {/* Sort */}
              <div className="relative">
                <select
                  value={filters.sort || 'newest'}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="input-field py-1.5 text-sm pr-3 pl-8 appearance-none"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <FiChevronDown size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* View Toggle */}
              <div className="flex border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <FiGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <FiList size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1'}`}>
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="card p-3 space-y-3">
                  <div className="skeleton aspect-square rounded-lg" />
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-9 rounded-lg" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-4xl mb-4">🔍</p>
              <p className="font-medium">لا توجد منتجات تطابق بحثك</p>
              <button onClick={clearFilters} className="btn-primary mt-4 text-sm">مسح الفلاتر</button>
            </div>
          ) : (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1'}`}>
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => updateFilter('page', i + 1)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    filters.page === i + 1
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {filtersOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setFiltersOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-72 bg-white z-50 shadow-2xl overflow-y-auto p-4 animate-slide-down">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">الفلاتر</h3>
              <button onClick={() => setFiltersOpen(false)}><FiX size={20} /></button>
            </div>
            <FilterSidebar />
          </div>
        </>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="container-main py-8">
        <div className="skeleton h-8 w-64 rounded mb-6" />
        <div className="flex gap-6">
          <div className="hidden lg:block w-64 shrink-0">
            <div className="skeleton h-96 rounded-2xl" />
          </div>
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="card p-3 space-y-3">
                <div className="skeleton aspect-square rounded-lg" />
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-9 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
