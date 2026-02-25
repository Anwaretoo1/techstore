'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiPackage, FiShoppingCart, FiUsers, FiTrendingUp, FiPlus, FiEdit2, FiTrash2, FiMenu } from 'react-icons/fi';
import { useAuthStore } from '@/lib/store';
import { productsApi, ordersApi, usersApi } from '@/lib/api';
import { formatPrice, ORDER_STATUS_LABELS } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import type { Order } from '@/types';

const ADMIN_NAV = [
  { href: '/admin',            label: 'لوحة التحكم' },
  { href: '/admin/products',   label: 'المنتجات' },
  { href: '/admin/orders',     label: 'الطلبات' },
  { href: '/admin/categories', label: 'الفئات' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, user]);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    Promise.all([
      productsApi.getAll({ limit: 1 }),
      ordersApi.getAll({ limit: 5 }),
      usersApi.getAll({ limit: 1 }),
    ]).then(([pRes, oRes, uRes]) => {
      const orders: Order[] = oRes.data.data || [];
      const revenue = orders.reduce((s: number, o: Order) => s + o.total, 0);
      setStats({
        products: pRes.data.pagination?.total || 0,
        orders:   oRes.data.pagination?.total || 0,
        users:    uRes.data.pagination?.total || 0,
        revenue,
      });
      setRecentOrders(orders);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  if (isLoading || !user) return null;

  const statCards = [
    { label: 'إجمالي المنتجات', value: stats.products, icon: FiPackage,     color: 'bg-blue-50 text-blue-600',   href: '/admin/products' },
    { label: 'الطلبات الكلية',  value: stats.orders,   icon: FiShoppingCart, color: 'bg-orange-50 text-orange-500', href: '/admin/orders' },
    { label: 'العملاء',         value: stats.users,    icon: FiUsers,        color: 'bg-green-50 text-green-600',  href: '#' },
    { label: 'الإيرادات',       value: formatPrice(stats.revenue), icon: FiTrendingUp, color: 'bg-purple-50 text-purple-600', href: '#', isString: true },
  ];

  const statusClasses: Record<string, string> = {
    pending: 'badge-yellow', processing: 'badge-primary',
    shipped: 'badge-accent', delivered: 'badge-green', cancelled: 'badge-red',
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 right-0 z-30 w-56 bg-white border-l border-slate-200 flex flex-col transition-transform duration-300 ${navOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center px-5 border-b border-slate-200">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">TS</span>
            </div>
            <span className="font-bold text-primary-700">لوحة التحكم</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {ADMIN_NAV.map((item) => (
            <Link key={item.href} href={item.href} className="admin-nav-item" onClick={() => setNavOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link href="/" className="admin-nav-item text-slate-500">العودة للمتجر</Link>
        </nav>
        <div className="p-3 border-t border-slate-200 text-xs text-slate-400">
          {user.first_name} {user.last_name} · مدير
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:mr-56 min-h-screen">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center gap-3 px-4 lg:px-6 sticky top-0 z-20">
          <button onClick={() => setNavOpen(!navOpen)} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg">
            <FiMenu size={20} />
          </button>
          <h1 className="font-bold text-slate-800 text-lg">لوحة التحكم</h1>
        </header>

        <main className="p-4 lg:p-6 space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map(({ label, value, icon: Icon, color, href, isString }) => (
              <Link key={label} href={href} className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} shrink-0`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="text-xl font-bold text-slate-800 mt-0.5">
                    {isString ? value : value.toLocaleString('ar-SY')}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="card p-5">
            <h2 className="font-bold text-slate-800 mb-4">إجراءات سريعة</h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/products/new" className="btn-primary flex items-center gap-2 text-sm">
                <FiPlus size={15} />إضافة منتج
              </Link>
              <Link href="/admin/categories" className="btn-secondary flex items-center gap-2 text-sm">
                إدارة الفئات
              </Link>
              <Link href="/admin/orders" className="btn-secondary flex items-center gap-2 text-sm">
                <FiPackage size={15} />الطلبات
              </Link>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800">أحدث الطلبات</h2>
              <Link href="/admin/orders" className="text-sm text-primary-600 hover:underline">عرض الكل</Link>
            </div>
            {loading ? (
              <div className="space-y-2">{Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-12 rounded" />)}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>رقم الطلب</th><th>العميل</th><th>الإجمالي</th><th>الحالة</th><th>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o) => (
                      <tr key={o.id}>
                        <td className="font-medium">#{o.order_number}</td>
                        <td className="text-slate-600">{o.user?.first_name} {o.user?.last_name}</td>
                        <td className="font-bold text-primary-600">{formatPrice(o.total)}</td>
                        <td><span className={statusClasses[o.status] || 'badge-gray'}>{ORDER_STATUS_LABELS[o.status]}</span></td>
                        <td>
                          <Link href={`/admin/orders/${o.id}`} className="text-primary-600 hover:underline text-xs">عرض</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {navOpen && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setNavOpen(false)} />}
    </div>
  );
}
