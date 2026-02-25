'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiSearch, FiX } from 'react-icons/fi';
import { productsApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

interface Props { isOpen: boolean; onClose: () => void; }

export default function SearchModal({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
    else { setQuery(''); setResults([]); }
  }, [isOpen]);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    clearTimeout(debounceRef.current);
    if (!q.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await productsApi.search(q);
        setResults(res.data.data?.slice(0, 8) || []);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 350);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      <div className="fixed inset-0 bg-black/50 animate-fade-in" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-slide-down overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-200">
          <FiSearch size={20} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="ابحث عن منتج..."
            className="flex-1 text-slate-800 placeholder-slate-400 outline-none font-arabic text-base"
          />
          {query && (
            <button onClick={() => handleSearch('')} className="text-slate-400 hover:text-slate-600">
              <FiX size={18} />
            </button>
          )}
          <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700 shrink-0 px-2 py-1 border border-slate-200 rounded">
            إغلاق
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-6 text-center text-slate-500 text-sm">جاري البحث...</div>
          )}
          {!loading && query && results.length === 0 && (
            <div className="p-6 text-center text-slate-500 text-sm">لا توجد نتائج لـ "{query}"</div>
          )}
          {results.map((p) => {
            const price = p.sale_price ?? p.price;
            const image = p.images.find((i) => i.is_primary)?.url || p.images[0]?.url || '';
            return (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                onClick={onClose}
                className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors"
              >
                <div className="relative w-12 h-12 rounded-lg bg-slate-100 shrink-0 overflow-hidden">
                  {image && <Image src={image} alt={p.name_ar} fill className="object-contain" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{p.name_ar}</p>
                  <p className="text-xs text-slate-500 truncate">{p.category?.name_ar}</p>
                </div>
                <p className="text-primary-600 font-bold text-sm shrink-0">{formatPrice(price)}</p>
              </Link>
            );
          })}
          {results.length > 0 && (
            <Link
              href={`/products?search=${query}`}
              onClick={onClose}
              className="block text-center py-3 text-sm text-primary-600 hover:bg-primary-50 transition-colors border-t border-slate-100"
            >
              عرض جميع النتائج ({results.length}+)
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
