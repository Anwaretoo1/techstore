'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiCheck, FiCreditCard, FiTruck } from 'react-icons/fi';
import { useCartStore, useAuthStore } from '@/lib/store';
import { ordersApi } from '@/lib/api';
import { formatPrice, CITIES, PAYMENT_METHOD_LABELS } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

type Step = 'address' | 'payment' | 'review';
type PaymentMethod = 'cash_on_delivery' | 'syriatel_cash' | 'mtn_cash' | 'sham_cash';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [step, setStep] = useState<Step>('address');
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    full_name: '', phone: '', city: 'دمشق', area: '', street: '', notes: '',
  });
  const [payment, setPayment] = useState<PaymentMethod>('cash_on_delivery');

  const subtotal = total();
  const shipping = subtotal > 500 ? 0 : 25;
  const finalTotal = subtotal + shipping;

  if (items.length === 0) return (
    <div className="container-main py-16 text-center">
      <h2 className="text-xl font-bold text-slate-700 mb-4">لا توجد منتجات في السلة</h2>
      <Link href="/products" className="btn-primary">تصفح المنتجات</Link>
    </div>
  );

  if (!isAuthenticated) return (
    <div className="container-main py-16 text-center">
      <h2 className="text-xl font-bold text-slate-700 mb-2">يجب تسجيل الدخول أولاً</h2>
      <p className="text-slate-500 mb-6">يجب أن تكون مسجلاً للمتابعة في الدفع</p>
      <Link href="/auth/login?redirect=/checkout" className="btn-primary">تسجيل الدخول</Link>
    </div>
  );

  const steps: { id: Step; label: string; icon: React.ElementType }[] = [
    { id: 'address', label: 'عنوان الشحن', icon: FiTruck },
    { id: 'payment', label: 'طريقة الدفع', icon: FiCreditCard },
    { id: 'review',  label: 'مراجعة الطلب', icon: FiCheck },
  ];

  const stepIndex = steps.findIndex((s) => s.id === step);

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        items: items.map(({ product, quantity }) => ({
          product_id: product.id,
          quantity,
          unit_price: product.sale_price ?? product.price,
        })),
        shipping_address: address,
        payment_method: payment,
        subtotal,
        shipping_cost: shipping,
        total: finalTotal,
      };
      const res = await ordersApi.create(orderData);
      clearCart();
      toast.success('تم تقديم طلبك بنجاح!');
      router.push(`/account/orders/${res.data.data.id}?success=1`);
    } catch {
      toast.error('حدث خطأ أثناء تقديم الطلب. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-main py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">إتمام الشراء</h1>

      {/* Steps Indicator */}
      <div className="flex items-center mb-8">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <div className={`flex items-center gap-2 ${i <= stepIndex ? 'text-primary-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                i < stepIndex ? 'bg-primary-600 border-primary-600 text-white'
                : i === stepIndex ? 'border-primary-600 text-primary-600'
                : 'border-slate-300 text-slate-400'
              }`}>
                {i < stepIndex ? <FiCheck size={14} /> : i + 1}
              </div>
              <span className="text-sm font-medium hidden sm:block">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-3 ${i < stepIndex ? 'bg-primary-600' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form Area */}
        <div className="lg:col-span-2">
          {/* Step 1: Address */}
          {step === 'address' && (
            <div className="card p-6">
              <h2 className="font-bold text-slate-800 text-lg mb-5 flex items-center gap-2">
                <FiTruck size={18} className="text-primary-600" />عنوان الشحن
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الاسم الكامل *</label>
                  <input
                    value={address.full_name}
                    onChange={(e) => setAddress((a) => ({ ...a, full_name: e.target.value }))}
                    className="input-field" placeholder="محمد أحمد"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">رقم الهاتف *</label>
                  <input
                    value={address.phone}
                    onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))}
                    className="input-field" placeholder="+963 9XX XXX XXX" dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">المحافظة *</label>
                  <select
                    value={address.city}
                    onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                    className="input-field"
                  >
                    {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">المنطقة / الحي *</label>
                  <input
                    value={address.area}
                    onChange={(e) => setAddress((a) => ({ ...a, area: e.target.value }))}
                    className="input-field" placeholder="المزة، كفرسوسة..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">العنوان التفصيلي *</label>
                  <input
                    value={address.street}
                    onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))}
                    className="input-field" placeholder="اسم الشارع، رقم البناء، الطابق..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">ملاحظات للمندوب (اختياري)</label>
                  <textarea
                    value={address.notes}
                    onChange={(e) => setAddress((a) => ({ ...a, notes: e.target.value }))}
                    className="input-field resize-none h-20" placeholder="أي تعليمات إضافية..."
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    if (!address.full_name || !address.phone || !address.area || !address.street) {
                      toast.error('يرجى تعبئة جميع الحقول المطلوبة');
                      return;
                    }
                    setStep('payment');
                  }}
                  className="btn-primary"
                >
                  التالي: طريقة الدفع
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 'payment' && (
            <div className="card p-6">
              <h2 className="font-bold text-slate-800 text-lg mb-5 flex items-center gap-2">
                <FiCreditCard size={18} className="text-primary-600" />طريقة الدفع
              </h2>
              <div className="space-y-3">
                {(Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][]).map(([method, label]) => (
                  <label
                    key={method}
                    className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${payment === method ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <input
                      type="radio" name="payment" value={method}
                      checked={payment === method}
                      onChange={() => setPayment(method)}
                      className="accent-primary-600"
                    />
                    <div>
                      <p className="font-semibold text-slate-800">{label}</p>
                      {method === 'cash_on_delivery' && <p className="text-xs text-slate-500 mt-0.5">ادفع نقداً عند استلام الطلب</p>}
                      {method === 'syriatel_cash' && <p className="text-xs text-slate-500 mt-0.5">ادفع عبر سيريتل كاش — سيتم التواصل معك</p>}
                      {method === 'mtn_cash' && <p className="text-xs text-slate-500 mt-0.5">ادفع عبر MTN كاش — سيتم التواصل معك</p>}
                      {method === 'sham_cash' && <p className="text-xs text-slate-500 mt-0.5">ادفع عبر شام كاش — سيتم التواصل معك</p>}
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-6 flex justify-between">
                <button onClick={() => setStep('address')} className="btn-ghost">السابق</button>
                <button onClick={() => setStep('review')} className="btn-primary">التالي: مراجعة الطلب</button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 'review' && (
            <div className="card p-6">
              <h2 className="font-bold text-slate-800 text-lg mb-5 flex items-center gap-2">
                <FiCheck size={18} className="text-primary-600" />مراجعة الطلب
              </h2>

              {/* Address Summary */}
              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <p className="text-sm font-semibold text-slate-700 mb-1">عنوان الشحن</p>
                <p className="text-sm text-slate-600">{address.full_name} — {address.phone}</p>
                <p className="text-sm text-slate-600">{address.city}، {address.area}، {address.street}</p>
              </div>

              {/* Payment Summary */}
              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <p className="text-sm font-semibold text-slate-700 mb-1">طريقة الدفع</p>
                <p className="text-sm text-slate-600">{PAYMENT_METHOD_LABELS[payment]}</p>
              </div>

              {/* Items Summary */}
              <div className="space-y-2 mb-4">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between text-sm">
                    <span className="text-slate-700">{product.name_ar} × {quantity}</span>
                    <span className="font-medium">{formatPrice((product.sale_price ?? product.price) * quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-between">
                <button onClick={() => setStep('payment')} className="btn-ghost">السابق</button>
                <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary">
                  {loading ? 'جاري التقديم...' : 'تأكيد الطلب'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <div className="card p-5 sticky top-24">
            <h3 className="font-bold text-slate-800 mb-4">ملخص الطلب</h3>
            <div className="space-y-2 text-sm mb-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between text-slate-600">
                  <span className="truncate ml-2">{product.name_ar} ×{quantity}</span>
                  <span className="shrink-0 font-medium">{formatPrice((product.sale_price ?? product.price) * quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>المجموع الفرعي</span><span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>الشحن</span>
                <span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'مجاني' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-2">
                <span>الإجمالي</span>
                <span className="text-primary-600 text-base">{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
