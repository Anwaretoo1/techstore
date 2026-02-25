'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiShield, FiTruck, FiPhone, FiRefreshCw } from 'react-icons/fi';

const slides = [
  {
    title: 'أقوى اللابتوبات',
    subtitle: 'بأسعار تنافسية في سوريا',
    desc: 'لابتوبات جيمينج، عمل، ودراسة من أفضل الماركات العالمية',
    cta: 'تسوق الآن',
    href: '/products?category=laptops',
    badge: 'خصم حتى 20%',
    bg: 'from-primary-700 to-primary-900',
    accent: 'bg-accent',
  },
  {
    title: 'معدات الجيمينج',
    subtitle: 'ارفع مستواك في اللعب',
    desc: 'شاشات عالية التردد، ماوس، وكيبورد احترافي',
    cta: 'اكتشف المزيد',
    href: '/products?category=gaming',
    badge: 'جديد',
    bg: 'from-slate-800 to-slate-950',
    accent: 'bg-red-500',
  },
];

const features = [
  { icon: FiTruck, title: 'توصيل لكل سوريا', desc: 'نوصل لجميع المحافظات' },
  { icon: FiShield, title: 'ضمان الجودة', desc: 'منتجات أصلية مع ضمان' },
  { icon: FiPhone, title: 'دعم 7/24', desc: 'فريق دعم متاح دائماً' },
  { icon: FiRefreshCw, title: 'سهولة الإرجاع', desc: 'إرجاع خلال 14 يوم' },
];

export default function HeroBanner() {
  return (
    <section>
      {/* Hero Slide */}
      <div className={`bg-gradient-to-l ${slides[0].bg} text-white`}>
        <div className="container-main py-14 md:py-20">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Text */}
            <div className="flex-1 text-center md:text-right">
              <span className={`inline-block ${slides[0].accent} text-white text-xs font-bold px-3 py-1 rounded-full mb-4`}>
                {slides[0].badge}
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-3">
                {slides[0].title}
              </h1>
              <p className="text-xl text-white/80 mb-2">{slides[0].subtitle}</p>
              <p className="text-white/60 text-sm mb-8 max-w-md">{slides[0].desc}</p>
              <div className="flex gap-3 justify-center md:justify-start">
                <Link href={slides[0].href} className="btn-accent flex items-center gap-2">
                  {slides[0].cta}
                  <FiArrowLeft size={16} className="icon-flip" />
                </Link>
                <Link href="/products" className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors">
                  جميع المنتجات
                </Link>
              </div>
            </div>

            {/* Hero Image Placeholder */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-72 h-60 md:w-96 md:h-72">
                <div className="w-full h-full bg-white/10 rounded-2xl flex items-center justify-center'>">
                  <div className="text-center text-white/40">
                    <div className="text-6xl mb-2">💻</div>
                    <p className="text-sm">صورة المنتج</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="container-main">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-x-reverse divide-slate-200">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 py-4 px-4">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{title}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
