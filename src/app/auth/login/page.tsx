'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { setUser } = useAuthStore();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(form.email, form.password);
      const { token, user } = res.data.data;
      Cookies.set('token', token, { expires: 7 });
      setUser(user);
      toast.success(`أهلاً ${user.first_name}!`);
      router.push(redirect);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">TS</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">تسجيل الدخول</h1>
          <p className="text-slate-500 text-sm mt-1">أهلاً بعودتك!</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
              <div className="relative">
                <FiMail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="input-field pr-9"
                  placeholder="example@email.com"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور</label>
              <div className="relative">
                <FiLock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="input-field pr-9 pl-9"
                  placeholder="••••••••"
                  dir="ltr"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              ليس لديك حساب؟{' '}
              <Link href="/auth/register" className="text-primary-600 font-semibold hover:underline">
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="w-full max-w-md space-y-4 px-4">
          <div className="skeleton h-14 w-14 rounded-2xl mx-auto" />
          <div className="skeleton h-8 w-48 rounded mx-auto" />
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
