'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { FiArrowRight, FiEye } from 'react-icons/fi';
import { ordersApi } from '@/lib/api';
import { formatPrice, ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import type { Order, OrderStatus } from '@/types';

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const limit = 15;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ordersApi.getAll({ page, limit, status: statusFilter || undefined });
      setOrders(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      toast.success('تم تحديث حالة الطلب');
      fetchOrders();
    } catch { toast.error('فشل تحديث الحالة'); }
  };

  const statusClasses: Record<string, string> = {
    pending: 'badge-yellow', processing: 'badge-primary',
    shipped: 'badge-accent', delivered: 'badge-green', cancelled: 'badge-red',
  };

  const pages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
        <Link href="/admin" className="text-slate-500 hover:text-slate-700">
          <FiArrowRight size={18} className="icon-flip" />
        </Link>
        <h1 className="font-bold text-slate-800 text-lg flex-1">إدارة الطلبات</h1>
      </div>

      <div className="p-6">
        {/* Filter */}
        <div className="card p-4 mb-5 flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input-field text-sm w-48"
          >
            <option value="">جميع الحالات</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>رقم الطلب</th><th>العميل</th><th>طريقة الدفع</th>
                  <th>الإجمالي</th><th>الحالة</th><th>التاريخ</th><th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(6).fill(0).map((_, i) => (
                    <tr key={i}>{Array(7).fill(0).map((_,j)=><td key={j}><div className="skeleton h-5 rounded"/></td>)}</tr>
                  ))
                ) : orders.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-400">لا توجد طلبات</td></tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id}>
                      <td className="font-medium">#{o.order_number}</td>
                      <td className="text-slate-600">
                        <p>{o.user?.first_name} {o.user?.last_name}</p>
                        <p className="text-xs text-slate-400">{o.user?.phone}</p>
                      </td>
                      <td className="text-slate-600 text-sm">{PAYMENT_METHOD_LABELS[o.payment_method]}</td>
                      <td className="font-bold text-primary-600">{formatPrice(o.total)}</td>
                      <td>
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          className={`text-xs font-medium px-2 py-1 rounded-lg border-0 cursor-pointer ${statusClasses[o.status] || 'badge-gray'}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                      </td>
                      <td className="text-slate-500 text-sm">{new Date(o.created_at).toLocaleDateString('ar-SY')}</td>
                      <td>
                        <Link href={`/admin/orders/${o.id}`} className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors inline-flex">
                          <FiEye size={15} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-200">
              <p className="text-sm text-slate-500">{total} طلب إجمالي</p>
              <div className="flex gap-1">
                {Array.from({ length: pages }).map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded text-sm ${page === i+1 ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 hover:bg-slate-50'}`}>
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
