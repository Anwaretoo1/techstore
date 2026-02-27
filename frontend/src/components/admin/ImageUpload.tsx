'use client';

import { useRef, useState } from 'react';
import { FiUploadCloud, FiImage, FiX, FiLoader } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';

interface Props {
  url: string;
  alt?: string;
  onUrlChange: (url: string) => void;
  onAltChange?: (alt: string) => void;
  label?: string;
  isPrimary?: boolean;
  onRemove?: () => void;
}

export default function ImageUpload({ url, alt = '', onUrlChange, onAltChange, label, isPrimary, onRemove }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset the input so the same file can be re-selected
    e.target.value = '';

    setUploading(true);
    const toastId = toast.loading('جاري رفع الصورة إلى Cloudinary...');

    try {
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${Cookies.get('token') || ''}` },
        body: fd,
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'فشل الرفع');

      onUrlChange(data.url);
      toast.success('تم رفع الصورة بنجاح ✓', { id: toastId });
    } catch (err: unknown) {
      toast.error((err as Error).message || 'فشل رفع الصورة', { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex gap-3 items-start">
      {/* Thumbnail preview */}
      <div className="w-16 h-16 rounded-xl bg-slate-100 border-2 border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative">
        {uploading ? (
          <FiLoader size={20} className="text-primary-500 animate-spin" />
        ) : url ? (
          <img
            src={url}
            alt={alt}
            className="w-full h-full object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <FiImage size={20} className="text-slate-300" />
        )}
        {isPrimary && (
          <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold bg-primary-600 text-white py-0.5">
            رئيسية
          </span>
        )}
      </div>

      {/* Inputs */}
      <div className="flex-1 space-y-2">
        {/* URL input + upload button row */}
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            className="input-field text-sm flex-1 font-mono text-xs"
            placeholder="https://res.cloudinary.com/... أو ارفع صورة ←"
            dir="ltr"
          />
          {/* Upload button */}
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shrink-0 whitespace-nowrap"
          >
            {uploading ? <FiLoader size={13} className="animate-spin" /> : <FiUploadCloud size={13} />}
            {uploading ? 'جاري الرفع...' : 'رفع صورة'}
          </button>

          {/* Hidden file input */}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Alt text input */}
        {onAltChange && (
          <input
            type="text"
            value={alt}
            onChange={(e) => onAltChange(e.target.value)}
            className="input-field text-sm"
            placeholder="وصف الصورة للـ SEO (اختياري)"
          />
        )}

        {/* Drop zone hint */}
        {!url && !uploading && (
          <p className="text-[11px] text-slate-400">
            اختر صورة من جهازك (JPG, PNG, WebP — حتى 5MB) أو الصق رابطاً مباشراً
          </p>
        )}
      </div>

      {/* Remove button */}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
          title="حذف هذه الصورة"
        >
          <FiX size={16} />
        </button>
      )}
    </div>
  );
}
