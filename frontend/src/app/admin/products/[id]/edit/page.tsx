'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FiArrowRight, FiPlus, FiTrash2, FiSave, FiImage } from 'react-icons/fi';
import { productsApi, categoriesApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import type { Category, Specification } from '@/types';

interface ImageEntry { url: string; alt: string; }

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState({
    name: '', name_ar: '', description: '', description_ar: '',
    price: '', sale_price: '', sku: '', stock: '',
    category_id: '', brand: '', is_featured: false, is_active: true,
  });
  const [specs, setSpecs] = useState<Specification[]>([]);
  const [images, setImages] = useState<ImageEntry[]>([{ url: '', alt: '' }]);

  useEffect(() => {
    Promise.all([categoriesApi.getAll(), productsApi.getById(parseInt(id))])
      .then(([catRes, prodRes]) => {
        setCategories(catRes.data.data || []);
        const p = prodRes.data.data;
        setForm({
          name: p.name || '', name_ar: p.name_ar || '',
          description: p.description || '', description_ar: p.description_ar || '',
          price: String(p.price || ''), sale_price: p.sale_price ? String(p.sale_price) : '',
          sku: p.sku || '', stock: String(p.stock || ''),
          category_id: p.category_id ? String(p.category_id) : '',
          brand: p.brand || '', is_featured: !!p.is_featured, is_active: p.is_active !== false,
        });
        setSpecs(p.specifications || []);
        if (p.images && p.images.length > 0) {
          setImages(p.images.map((img: { url: string; alt: string }) => ({ url: img.url || '', alt: img.alt || '' })));
        }
      })
      .catch(() => { toast.error('فشل تحميل بيانات المنتج'); router.push('/admin/products'); })
      .finally(() => setFetching(false));
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const addSpec = () => setSpecs((s) => [...s, { key: '', key_ar: '', value: '', value_ar: '' }]);
  const removeSpec = (i: number) => setSpecs((s) => s.filter((_, idx) => idx !== i));
  const updateSpec = (i: number, field: keyof Specification, val: string) =>
    setSpecs((s) => s.map((sp, idx) => idx === i ? { ...sp, [field]: val } : sp));

  const addImage = () => setImages((imgs) => [...imgs, { url: '', alt: '' }]);
  const removeImage = (i: number) => setImages((imgs) => imgs.filter((_, idx) => idx !== i));
  const updateImage = (i: number, field: keyof ImageEntry, val: string) =>
    setImages((imgs) => imgs.map((img, idx) => idx === i ? { ...img, [field]: val } : img));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await productsApi.update(parseInt(id), {
        ...form,
        price: parseFloat(form.price),
        sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
        stock: parseInt(form.stock),
        category_id: form.category_id ? parseInt(form.category_id) : null,
        specifications: specs.filter((s) => s.key && s.value),
        images: images.filter((img) => img.url.trim()).map((img, i) => ({ ...img, is_primary: i === 0, sort_order: i })),
        tags: [],
      });
      toast.success('تم تحديث المنتج بنجاح');
      router.push('/admin/products');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || 'فشل تحديث المنتج');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
        <Link href="/admin/products" className="text-slate-500 hover:text-slate-700">
          <FiArrowRight size={18} className="icon-flip" />
        </Link>
        <h1 className="font-bold text-slate-800 text-lg flex-1">تعديل المنتج</h1>
        <button form="product-form" type="submit" disabled={loading} className="btn-primary flex items-center gap-2 text-sm">
          <FiSave size={15} />{loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>

      <form id="product-form" onSubmit={handleSubmit} className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Basic Info */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-slate-700 pb-2 border-b border-slate-100">المعلومات الأساسية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">الاسم بالعربية *</label>
              <input name="name_ar" value={form.name_ar} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">الاسم بالإنجليزية *</label>
              <input name="name" value={form.name} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">الوصف بالعربية</label>
              <textarea name="description_ar" value={form.description_ar} onChange={handleChange} rows={3} className="input-field resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">الوصف بالإنجليزية</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="input-field resize-none" />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="font-semibold text-slate-700">صور المنتج</h2>
            <button type="button" onClick={addImage} className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700">
              <FiPlus size={14} /> إضافة صورة
            </button>
          </div>
          <p className="text-xs text-slate-400">الصورة الأولى تكون الصورة الرئيسية. الصق رابط URL مباشر للصورة</p>
          {images.map((img, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                {img.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.url} alt="" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <FiImage size={18} className="text-slate-300" />
                )}
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="md:col-span-2">
                  <input value={img.url} onChange={(e) => updateImage(i, 'url', e.target.value)} className="input-field text-sm" placeholder="https://example.com/image.jpg" />
                </div>
                <input value={img.alt} onChange={(e) => updateImage(i, 'alt', e.target.value)} className="input-field text-sm" placeholder="وصف الصورة (اختياري)" />
              </div>
              {i === 0 ? (
                <span className="text-xs bg-primary-50 text-primary-600 px-2 py-2 rounded-lg shrink-0">رئيسية</span>
              ) : (
                <button type="button" onClick={() => removeImage(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg shrink-0"><FiTrash2 size={14} /></button>
              )}
            </div>
          ))}
        </div>

        {/* Pricing & Stock */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-slate-700 pb-2 border-b border-slate-100">السعر والمخزون</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">السعر ($) *</label>
              <input name="price" type="number" value={form.price} onChange={handleChange} required min="0" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">سعر الخصم ($)</label>
              <input name="sale_price" type="number" value={form.sale_price} onChange={handleChange} min="0" className="input-field" placeholder="اختياري" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SKU *</label>
              <input name="sku" value={form.sku} onChange={handleChange} required className="input-field font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">المخزون *</label>
              <input name="stock" type="number" value={form.stock} onChange={handleChange} required min="0" className="input-field" />
            </div>
          </div>
        </div>

        {/* Category & Brand */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-slate-700 pb-2 border-b border-slate-100">التصنيف والعلامة التجارية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">التصنيف</label>
              <select name="category_id" value={form.category_id} onChange={handleChange} className="input-field">
                <option value="">-- اختر تصنيف --</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name_ar}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">العلامة التجارية</label>
              <input name="brand" value={form.brand} onChange={handleChange} className="input-field" />
            </div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} className="w-4 h-4 rounded accent-primary-600" />
              <span className="text-sm text-slate-700">منتج مميز</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 rounded accent-primary-600" />
              <span className="text-sm text-slate-700">نشط (مرئي للزوار)</span>
            </label>
          </div>
        </div>

        {/* Specifications */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="font-semibold text-slate-700">المواصفات</h2>
            <button type="button" onClick={addSpec} className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700">
              <FiPlus size={14} /> إضافة مواصفة
            </button>
          </div>
          {specs.length === 0 && <p className="text-sm text-slate-400 text-center py-4">لا توجد مواصفات</p>}
          {specs.map((s, i) => (
            <div key={i} className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg">
              <input value={s.key_ar} onChange={(e) => updateSpec(i, 'key_ar', e.target.value)} className="input-field text-sm" placeholder="الخاصية (عربي)" />
              <input value={s.key} onChange={(e) => updateSpec(i, 'key', e.target.value)} className="input-field text-sm" placeholder="Property (EN)" />
              <input value={s.value_ar} onChange={(e) => updateSpec(i, 'value_ar', e.target.value)} className="input-field text-sm" placeholder="القيمة (عربي)" />
              <div className="flex gap-2">
                <input value={s.value} onChange={(e) => updateSpec(i, 'value', e.target.value)} className="input-field text-sm flex-1" placeholder="Value (EN)" />
                <button type="button" onClick={() => removeSpec(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><FiTrash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </form>
    </div>
  );
}
