'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FiShoppingCart, FiStar, FiChevronRight, FiMinus, FiPlus, FiShare2 } from 'react-icons/fi';
import { productsApi } from '@/lib/api';
import { useCartStore } from '@/lib/store';
import { formatPrice, calcDiscount } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import type { Product } from '@/types';
import ProductCard from '@/components/product/ProductCard';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  useEffect(() => {
    productsApi.getById(Number(id)).then((res) => {
      const p = res.data.data;
      setProduct(p);
      // Fetch related
      if (p?.category_id) {
        productsApi.getAll({ category: p.category?.slug, limit: 4 }).then((r) => {
          setRelated((r.data.data || []).filter((rp: Product) => rp.id !== p.id).slice(0, 4));
        });
      }
    }).catch(() => router.push('/products'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="container-main py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="skeleton aspect-square rounded-2xl" />
        <div className="space-y-4">
          <div className="skeleton h-8 w-3/4 rounded" />
          <div className="skeleton h-6 w-1/3 rounded" />
          <div className="skeleton h-24 rounded" />
          <div className="skeleton h-12 rounded-xl" />
        </div>
      </div>
    </div>
  );

  if (!product) return null;

  const price = product.sale_price ?? product.price;
  const hasDiscount = product.sale_price !== null && product.sale_price < product.price;
  const discount = hasDiscount ? calcDiscount(product.price, product.sale_price!) : 0;
  const inStock = product.stock > 0;

  const handleAddToCart = () => {
    if (!inStock) return;
    addItem(product, quantity);
    toast.success(`تمت إضافة ${quantity} قطعة إلى السلة`);
  };

  return (
    <div className="container-main py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-primary-600">الرئيسية</Link>
        <FiChevronRight size={14} className="icon-flip" />
        <Link href="/products" className="hover:text-primary-600">المنتجات</Link>
        {product.category && (
          <>
            <FiChevronRight size={14} className="icon-flip" />
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-primary-600">
              {product.category.name_ar}
            </Link>
          </>
        )}
        <FiChevronRight size={14} className="icon-flip" />
        <span className="text-slate-800 font-medium truncate max-w-48">{product.name_ar}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div>
          {/* Main Image */}
          <div className="relative aspect-square bg-slate-50 rounded-2xl overflow-hidden mb-3 flex items-center justify-center">
            {product.images[selectedImage] ? (
              <Zoom>
                <img
                  src={product.images[selectedImage].url}
                  alt={product.images[selectedImage].alt || product.name_ar}
                  className="object-contain p-6 w-full h-full max-h-[500px]"
                />
              </Zoom>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-300 text-5xl">📦</div>
            )}
            {hasDiscount && (
              <div className="absolute top-4 right-4 pointer-events-none">
                <span className="price-sale-badge text-sm px-3 py-1">{discount}% خصم</span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-colors ${i === selectedImage ? 'border-primary-500' : 'border-transparent'}`}
                >
                  <img src={img.url} alt={img.alt || ''} className="object-contain p-1 w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {/* Brand & SKU */}
          <div className="flex items-center gap-3 mb-2">
            {product.brand && <span className="badge-primary text-xs">{product.brand}</span>}
            <span className="text-xs text-slate-400">SKU: {product.sku}</span>
          </div>

          {/* Name */}
          <h1 className="text-2xl font-bold text-slate-900 leading-relaxed mb-3">
            {product.name_ar}
          </h1>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar key={i} size={16} className={i < Math.round(product.rating) ? 'fill-current' : 'text-slate-300'} />
                ))}
              </div>
              <span className="text-sm text-slate-500">({product.review_count} تقييم)</span>
            </div>
          )}

          {/* Price */}
          <div className="bg-slate-50 rounded-xl p-4 mb-5">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-primary-600">{formatPrice(price)}</span>
              {hasDiscount && (
                <>
                  <span className="price-original text-base">{formatPrice(product.price)}</span>
                  <span className="price-sale-badge">وفر {formatPrice(product.price - price)}</span>
                </>
              )}
            </div>
          </div>

          {/* Stock */}
          <div className={`flex items-center gap-2 mb-5 text-sm font-medium ${inStock ? 'text-green-600' : 'text-red-500'}`}>
            <div className={`w-2 h-2 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`} />
            {inStock ? `متوفر (${product.stock} قطعة)` : 'نفدت الكمية'}
          </div>

          {/* Quantity + Add to Cart */}
          {inStock && (
            <div className="flex gap-3 mb-5">
              <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-3 hover:bg-slate-100 transition-colors"
                >
                  <FiMinus size={16} />
                </button>
                <span className="px-4 font-bold text-slate-800 min-w-[3rem] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-3 hover:bg-slate-100 transition-colors"
                >
                  <FiPlus size={16} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <FiShoppingCart size={18} />
                أضف إلى السلة
              </button>
            </div>
          )}

          {/* Share */}
          <button
            onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('تم نسخ الرابط'); }}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition-colors"
          >
            <FiShare2 size={15} />مشاركة المنتج
          </button>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {product.tags.map((tag) => (
                <span key={tag} className="badge-gray text-xs">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10">
        <div className="flex border-b border-slate-200 gap-0">
          {([['desc', 'الوصف'], ['specs', 'المواصفات'], ['reviews', 'التقييمات']] as const).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="py-6">
          {activeTab === 'desc' && (
            <div className="prose prose-slate max-w-none text-slate-700 leading-loose text-sm">
              {product.description_ar || product.description || 'لا يوجد وصف متاح.'}
            </div>
          )}

          {activeTab === 'specs' && (
            <div>
              {product.specifications?.length > 0 ? (
                <table className="w-full text-sm">
                  <tbody>
                    {product.specifications.map((spec, i) => (
                      <tr key={i} className={`${i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}>
                        <th className="px-4 py-2.5 text-slate-600 font-semibold text-right w-1/3 border border-slate-200">{spec.key_ar || spec.key}</th>
                        <td className="px-4 py-2.5 text-slate-800 border border-slate-200">{spec.value_ar || spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-slate-500 text-sm">لا توجد مواصفات متاحة.</p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="text-center py-8 text-slate-400">
              <p className="text-3xl mb-3">⭐</p>
              <p>نظام التقييمات قريباً</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="section-title mb-6">منتجات ذات صلة</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
