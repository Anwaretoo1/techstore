'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiX, FiTrash2, FiPlus, FiMinus, FiShoppingBag } from 'react-icons/fi';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';

interface Props { isOpen: boolean; onClose: () => void; }

export default function CartDrawer({ isOpen, onClose }: Props) {
  const { items, removeItem, updateQuantity, total } = useCartStore();

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 animate-fade-in" onClick={onClose} />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="font-bold text-lg text-slate-800">سلة التسوق</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <FiX size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
              <FiShoppingBag size={48} />
              <p className="font-medium">السلة فارغة</p>
              <Link href="/products" onClick={onClose} className="btn-primary text-sm">
                تصفح المنتجات
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(({ product, quantity }) => {
                const price = product.sale_price ?? product.price;
                const image = (product.images && product.images.length > 0)
                  ? (product.images.find((i) => i.is_primary)?.url || product.images[0]?.url)
                  : '';
                return (
                  <div key={product.id} className="flex gap-3 card p-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                      {image && <img src={image} alt={product.name_ar} className="object-contain w-full h-full" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 line-clamp-2">{product.name_ar}</p>
                      <p className="text-primary-600 font-bold text-sm mt-1">{formatPrice(price)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="w-6 h-6 border border-slate-300 rounded flex items-center justify-center hover:border-primary-500 transition-colors"
                        >
                          <FiMinus size={12} />
                        </button>
                        <span className="text-sm font-medium w-6 text-center">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.stock}
                          className="w-6 h-6 border border-slate-300 rounded flex items-center justify-center hover:border-primary-500 transition-colors disabled:opacity-50"
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(product.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors h-fit"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-slate-200 p-4 space-y-3">
            <div className="flex justify-between items-center font-bold text-slate-800">
              <span>المجموع</span>
              <span className="text-primary-600 text-lg">{formatPrice(total())}</span>
            </div>
            <Link href="/checkout" onClick={onClose} className="btn-primary w-full text-center block">
              إتمام الشراء
            </Link>
            <Link href="/cart" onClick={onClose} className="btn-secondary w-full text-center block">
              عرض السلة
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
