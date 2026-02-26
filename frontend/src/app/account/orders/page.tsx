'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiPackage, FiChevronRight, FiClock } from 'react-icons/fi';
import { useAuthStore } from '@/lib/store';
import { ordersApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:    { label: 'قيد المعالجة', color: 'bg-yellow-100 text-yellow-800' },
  confirmed:  { label: 'مؤكد',         color: 'bg-blue-100 text-blue-800' },
  shipped:    { label: 'تم الشحن',     color: 'bg-purple-100 text-purple-800' },
  delivered:  { label: 'تم التسليم',   color: 'bg-green-100 text-green-800' },
  cancelled:  { label: 'ملغى',          color: 'bg-red-100 text-red-800' },
};

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    ordersApi.getMyOrders().then((r) => setOrders(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [isAuthenticated]);

  return (
    <div className="container-main py-8 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-primary-600">الرئيسية</Link>
        <FiChevronRight size={14} className="icon-flip" />
        <Link href="/account" className="hover:text-primary-600">حسابي</Link>
        <FiChevronRight size={14} className="icon-flip" />
        <span className="text-slate-800 font-medium">طلباتي</span>
      </nav>

      <h1 className="text-2xl font-bold text-slate-800 mb-6">طلباتي</h1>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 card">
          <FiPackage size={48} className="text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-700 mb-2">لا توجد طلبات بعد</h2>
          <p className="text-slate-500 text-sm mb-6">لم تقم بأي عملية شراء حتى الآن</p>
          <Link href="/products" className="btn-primary">تسوق الآن</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = STATUS_LABELS[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-700' };
            return (
              <div key={order.id} className="card p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-bold text-slate-800">طلب #{order.order_number}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <FiClock size={12} />
                      {new Date(order.created_at).toLocaleDateString('ar-SY', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    {order.items_count || '—'} منتج
                  </span>
                  <span className="font-bold text-primary-600">{formatPrice(parseFloat(order.total))}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
