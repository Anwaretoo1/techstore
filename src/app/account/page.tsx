'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiUser, FiPackage, FiLogOut } from 'react-icons/fi';
import { useAuthStore } from '@/lib/store';
import { ordersApi, authApi } from '@/lib/api';
import { formatPrice, ORDER_STATUS_LABELS } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
import type { Order } from '@/types';

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    ordersApi.getMyOrders()
      .then((r) => setOrders(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleLogout = () => {
    authApi.logout();
    logout();
    Cookies.remove('token');
    toast.success('تم تسجيل الخروج');
    router.push('/');
  };

  if (!user) return null;

  const statusClasses: Record<string, string> = {
    pending:    'badge-yellow',
    processing: 'badge-primary',
    shipped:    'badge-accent',
    delivered:  'badge-green',
    cancelled:  'badge-red',
  };

  return (
    <div className="container-main py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">حسابي</h1>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-5">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-3">
                <FiUser size={28} className="text-primary-600" />
              </div>
              <p className="font-bold text-slate-800">{user.first_name} {user.last_name}</p>
              <p className="text-sm text-slate-500">{user.email}</p>
              {user.role === 'admin' && <span className="badge-primary mt-2">مدير</span>}
            </div>

            <nav className="space-y-1">
              <Link href="/account" className="admin-nav-item active">
                <FiUser size={16} />حسابي
              </Link>
              <Link href="/account/orders" className="admin-nav-item">
                <FiPackage size={16} />طلباتي
              </Link>
              {user.role === 'admin' && (
                <Link href="/admin" className="admin-nav-item">
                  لوحة التحكم
                </Link>
              )}
              <button onClick={handleLogout} className="admin-nav-item w-full text-right text-red-500 hover:bg-red-50 hover:text-red-600">
                <FiLogOut size={16} />تسجيل الخروج
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Info */}
          <div className="card p-5">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FiUser size={16} className="text-primary-600" />معلومات الحساب
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              {[
                { label: 'الاسم الأول', value: user.first_name },
                { label: 'الاسم الأخير', value: user.last_name },
                { label: 'البريد الإلكتروني', value: user.email },
                { label: 'رقم الهاتف', value: user.phone || '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-slate-500 text-xs mb-0.5">{label}</p>
                  <p className="font-medium text-slate-800">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <FiPackage size={16} className="text-primary-600" />آخر الطلبات
              </h2>
              <Link href="/account/orders" className="text-sm text-primary-600 hover:underline">عرض الكل</Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-16 rounded-lg" />)}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <FiPackage size={36} className="mx-auto mb-2" />
                <p className="text-sm">لا توجد طلبات بعد</p>
                <Link href="/products" className="btn-primary text-sm mt-3 inline-block">ابدأ التسوق</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>رقم الطلب</th>
                      <th>التاريخ</th>
                      <th>الإجمالي</th>
                      <th>الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id}>
                        <td>
                          <Link href={`/account/orders/${order.id}`} className="text-primary-600 hover:underline font-medium">
                            #{order.order_number}
                          </Link>
                        </td>
                        <td className="text-slate-500">{new Date(order.created_at).toLocaleDateString('ar-SY')}</td>
                        <td className="font-medium">{formatPrice(order.total)}</td>
                        <td>
                          <span className={statusClasses[order.status] || 'badge-gray'}>
                            {ORDER_STATUS_LABELS[order.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
