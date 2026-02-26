'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiArrowRight, FiStar } from 'react-icons/fi';
import { productsApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import type { Product } from '@/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 15;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsApi.getAll({ search: search || undefined, page, limit });
      setProducts(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleToggleFeatured = async (id: number, current: boolean) => {
    try {
      await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}` },
        body: JSON.stringify({ is_featured: !current }),
      });
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, is_featured: !current } : p));
      toast.success(!current ? 'تم تثبيت المنتج في الصفحة الرئيسية' : 'تم إلغاء تثبيت المنتج');
    } catch { toast.error('فشل تعديل المنتج'); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${name}"؟`)) return;
    try {
      await productsApi.delete(id);
      toast.success('تم حذف المنتج');
      fetchProducts();
    } catch { toast.error('فشل حذف المنتج'); }
  };

  const pages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
        <Link href="/admin" className="text-slate-500 hover:text-slate-700">
          <FiArrowRight size={18} className="icon-flip" />
        </Link>
        <h1 className="font-bold text-slate-800 text-lg flex-1">إدارة المنتجات</h1>
        <Link href="/admin/products/new" className="btn-primary flex items-center gap-2 text-sm">
          <FiPlus size={15} />منتج جديد
        </Link>
      </div>

      <div className="p-6">
        {/* Search */}
        <div className="card p-4 mb-5 flex gap-3">
          <div className="relative flex-1">
            <FiSearch size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="بحث عن منتج بالاسم أو SKU..."
              className="input-field pr-9 text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>SKU</th>
                  <th>السعر</th>
                  <th>المخزون</th>
                  <th>الحالة</th>
                  <th>مميز</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(8).fill(0).map((_, i) => (
                    <tr key={i}>
                      {Array(6).fill(0).map((__, j) => (
                        <td key={j}><div className="skeleton h-5 rounded" /></td>
                      ))}
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">لا توجد منتجات</td>
                  </tr>
                ) : (
                  products.map((p) => {
                    const image = p.images.find((i) => i.is_primary)?.url || p.images[0]?.url || '';
                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                              {image && <img src={image} alt={p.name_ar} className="object-contain w-full h-full" />}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800 text-sm line-clamp-1">{p.name_ar}</p>
                              <p className="text-xs text-slate-400">{p.category?.name_ar}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-slate-500 text-sm font-mono">{p.sku}</td>
                        <td>
                          <div>
                            <p className="font-bold text-primary-600 text-sm">{formatPrice(p.sale_price ?? p.price)}</p>
                            {p.sale_price && <p className="text-xs text-slate-400 line-through">{formatPrice(p.price)}</p>}
                          </div>
                        </td>
                        <td>
                          <span className={`font-medium text-sm ${p.stock > 10 ? 'text-green-600' : p.stock > 0 ? 'text-yellow-600' : 'text-red-500'}`}>
                            {p.stock}
                          </span>
                        </td>
                        <td>
                          <span className={p.is_active ? 'badge-green' : 'badge-gray'}>
                            {p.is_active ? 'نشط' : 'مخفي'}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleToggleFeatured(p.id, p.is_featured)}
                            title={p.is_featured ? 'إلغاء التثبيت' : 'تثبيت في الصفحة الرئيسية'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              p.is_featured
                                ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                                : 'text-slate-300 hover:text-yellow-500 hover:bg-yellow-50'
                            }`}
                          >
                            <FiStar size={16} fill={p.is_featured ? 'currentColor' : 'none'} />
                          </button>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/products/${p.id}/edit`}
                              className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            >
                              <FiEdit2 size={15} />
                            </Link>
                            <button
                              onClick={() => handleDelete(p.id, p.name_ar)}
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <FiTrash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-200">
              <p className="text-sm text-slate-500">{total} منتج إجمالي</p>
              <div className="flex gap-1">
                {Array.from({ length: pages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded text-sm ${page === i + 1 ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
