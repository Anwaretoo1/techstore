'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '', password: '', confirm_password: '',
  });

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      toast.error('كلمتا المرور غير متطابقتان');
      return;
    }
    if (form.password.length < 8) {
      toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.register({
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
      });
      const { token, user } = res.data.data;
      Cookies.set('token', token, { expires: 7 });
      setUser(user);
      toast.success('تم إنشاء حسابك بنجاح!');
      router.push('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'حدث خطأ أثناء إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'first_name',       label: 'الاسم الأول',       icon: FiUser,  type: 'text',     placeholder: 'محمد',             dir: 'rtl' },
    { key: 'last_name',        label: 'الاسم الأخير',       icon: FiUser,  type: 'text',     placeholder: 'أحمد',             dir: 'rtl' },
    { key: 'email',            label: 'البريد الإلكتروني',  icon: FiMail,  type: 'email',    placeholder: 'example@email.com', dir: 'ltr' },
    { key: 'phone',            label: 'رقم الهاتف',         icon: FiPhone, type: 'tel',      placeholder: '+963 9XX XXX XXX',  dir: 'ltr' },
  ] as const;

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">TS</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">إنشاء حساب جديد</h1>
          <p className="text-slate-500 text-sm mt-1">انضم إلى مجتمع TechStore Syria</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ key, label, icon: Icon, type, placeholder, dir }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                <div className="relative">
                  <Icon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={type}
                    value={form[key]}
                    onChange={update(key)}
                    className="input-field pr-9"
                    placeholder={placeholder}
                    dir={dir}
                    required
                  />
                </div>
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور</label>
              <div className="relative">
                <FiLock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={update('password')}
                  className="input-field pr-9 pl-9"
                  placeholder="8 أحرف على الأقل"
                  dir="ltr"
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">تأكيد كلمة المرور</label>
              <div className="relative">
                <FiLock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.confirm_password}
                  onChange={update('confirm_password')}
                  className="input-field pr-9"
                  placeholder="أعد كتابة كلمة المرور"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-6">
            لديك حساب بالفعل؟{' '}
            <Link href="/auth/login" className="text-primary-600 font-semibold hover:underline">تسجيل الدخول</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
