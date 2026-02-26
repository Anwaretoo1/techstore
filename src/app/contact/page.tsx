'use client';

import { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending
    await new Promise((r) => setTimeout(r, 1200));
    toast.success('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.');
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    setLoading(false);
  };

  return (
    <div className="container-main py-10">
      <div className="mb-8 text-center">
        <h1 className="section-title">تواصل معنا</h1>
        <p className="section-subtitle">فريقنا جاهز للمساعدة في أي استفسار</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="space-y-4">
          {[
            { icon: FiPhone,  title: 'الهاتف',          text: '+963 11 XXX XXXX', sub: 'متاح يومياً 9 ص – 9 م' },
            { icon: FiMail,   title: 'البريد الإلكتروني',text: 'info@techstore-syria.com', sub: 'نرد خلال 24 ساعة' },
            { icon: FiMapPin, title: 'الموقع',           text: 'دمشق، شارع المعرض', sub: 'السبت – الخميس' },
          ].map(({ icon: Icon, title, text, sub }) => (
            <div key={title} className="card p-5 flex gap-4">
              <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                <Icon size={20} className="text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{title}</p>
                <p className="text-sm text-slate-700 mt-0.5">{text}</p>
                <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}

          {/* WhatsApp CTA */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <p className="font-semibold text-green-800 mb-1">تواصل عبر واتساب</p>
            <p className="text-sm text-green-700 mb-3">الطريقة الأسرع للحصول على المساعدة</p>
            <a
              href={`https://wa.me/${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+963000000000').replace(/\D/g,'')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors inline-block"
            >
              ابدأ المحادثة
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-bold text-slate-800 text-lg mb-5">أرسل رسالة</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الاسم *</label>
                <input value={form.name} onChange={(e) => setForm(f => ({...f, name: e.target.value}))} className="input-field" placeholder="اسمك الكامل" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">رقم الهاتف</label>
                <input value={form.phone} onChange={(e) => setForm(f => ({...f, phone: e.target.value}))} className="input-field" placeholder="+963 ..." dir="ltr" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني *</label>
              <input type="email" value={form.email} onChange={(e) => setForm(f => ({...f, email: e.target.value}))} className="input-field" placeholder="example@email.com" dir="ltr" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">الموضوع *</label>
              <input value={form.subject} onChange={(e) => setForm(f => ({...f, subject: e.target.value}))} className="input-field" placeholder="موضوع رسالتك" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">الرسالة *</label>
              <textarea value={form.message} onChange={(e) => setForm(f => ({...f, message: e.target.value}))} className="input-field resize-none h-32" placeholder="اكتب رسالتك هنا..." required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              <FiSend size={15} />
              {loading ? 'جاري الإرسال...' : 'إرسال الرسالة'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
