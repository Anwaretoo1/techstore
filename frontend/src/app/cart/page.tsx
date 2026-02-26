'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiTag } from 'react-icons/fi';
import { useState } from 'react';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { couponsApi } from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = total();
  const shipping = subtotal > 500 ? 0 : 25;
  const finalTotal = subtotal - discount + shipping;

  const applyCoUpon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await couponsApi.validate(couponCode);
      const { discount_amount } = res.data.data;
      setDiscount(discount_amount);
      toast.success('تم تطبيق كود الخصم!');
    } catch {
      toast.error('كود الخصم غير صالح');
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) return (
    <div className="container-main py-16 text-center">
      <FiShoppingBag size={64} className="text-slate-300 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-slate-700 mb-2">سلتك فارغة</h2>
      <p className="text-slate-500 mb-6">أضف بعض المنتجات للبدء في التسوق</p>
      <Link href="/products" className="btn-primary">تصفح المنتجات</Link>
    </div>
  );

  return (
    <div className="container-main py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">سلة التسوق ({items.length} منتج)</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => {
            const price = product.sale_price ?? product.price;
            const image = product.images.find((i) => i.is_primary)?.url || product.images[0]?.url || '';
            return (
              <div key={product.id} className="card p-4 flex gap-4">
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                  {image && <Image src={image} alt={product.name_ar} fill className="object-contain p-2" />}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${product.id}`} className="font-semibold text-slate-800 hover:text-primary-600 line-clamp-2 text-sm">
                    {product.name_ar}
                  </Link>
                  <p className="text-xs text-slate-400 mt-1">{product.brand}</p>
                  <p className="text-primary-600 font-bold mt-2">{formatPrice(price)}</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <button
                    onClick={() => { removeItem(product.id); toast.success('تمت إزالة المنتج'); }}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <FiTrash2 size={16} />
                  </button>
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                    <button onClick={() => updateQuantity(product.id, quantity - 1)} className="px-2 py-1.5 hover:bg-slate-100">
                      <FiMinus size={13} />
                    </button>
                    <span className="px-3 text-sm font-medium min-w-[2rem] text-center">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      disabled={quantity >= product.stock}
                      className="px-2 py-1.5 hover:bg-slate-100 disabled:opacity-40"
                    >
                      <FiPlus size={13} />
                    </button>
                  </div>
                  <p className="text-sm font-bold text-slate-700">{formatPrice(price * quantity)}</p>
                </div>
              </div>
            );
          })}

          <button
            onClick={() => { clearCart(); toast.success('تم إفراغ السلة'); }}
            className="text-sm text-red-500 hover:text-red-700 transition-colors"
          >
            إفراغ السلة
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-24">
            <h3 className="font-bold text-slate-800 text-lg mb-4">ملخص الطلب</h3>

            {/* Coupon */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="كود الخصم"
                className="input-field text-sm flex-1"
              />
              <button
                onClick={applyCoUpon}
                disabled={couponLoading}
                className="btn-secondary text-sm px-3 flex items-center gap-1 shrink-0"
              >
                <FiTag size={13} />تطبيق
              </button>
            </div>

            {/* Summary Lines */}
            <div className="space-y-3 text-sm border-t border-slate-200 pt-4">
              <div className="flex justify-between text-slate-700">
                <span>المجموع الفرعي</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>الخصم</span>
                  <span>- {formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-700">
                <span>الشحن</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {shipping === 0 ? 'مجاني' : formatPrice(shipping)}
                </span>
              </div>
              {shipping === 0 && (
                <p className="text-xs text-green-600">🎉 حصلت على شحن مجاني!</p>
              )}
              {shipping > 0 && (
                <p className="text-xs text-slate-500">*شحن مجاني للطلبات فوق 500 $</p>
              )}

              <div className="border-t border-slate-200 pt-3 flex justify-between font-bold text-slate-900">
                <span>الإجمالي</span>
                <span className="text-primary-600 text-lg">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <Link href="/checkout" className="btn-primary w-full text-center block mt-5">
              المتابعة للدفع
            </Link>
            <Link href="/products" className="btn-ghost w-full text-center block mt-2 text-sm text-slate-600">
              مواصلة التسوق
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
