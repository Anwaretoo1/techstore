import Link from 'next/link';
import { FiFacebook, FiInstagram, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 mt-16">
      {/* Main Footer */}
      <div className="container-main py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TS</span>
              </div>
              <div>
                <p className="font-bold text-white text-lg leading-none">TechStore</p>
                <p className="text-xs text-slate-400">سوريا</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              وجهتك الأولى لأفضل معدات الكمبيوتر وملحقاته في سوريا. جودة عالية وأسعار منافسة.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-8 h-8 bg-slate-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
                <FiFacebook size={16} />
              </a>
              <a href="#" className="w-8 h-8 bg-slate-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
                <FiInstagram size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/products', label: 'جميع المنتجات' },
                { href: '/products?category=laptops', label: 'لابتوبات' },
                { href: '/products?category=desktops', label: 'ديسكتوب' },
                { href: '/products?category=monitors', label: 'شاشات' },
                { href: '/products?category=accessories', label: 'ملحقات' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-bold text-white mb-4">خدمة العملاء</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/contact', label: 'تواصل معنا' },
                { href: '/account/orders', label: 'تتبع طلبك' },
                { href: '/faq', label: 'الأسئلة الشائعة' },
                { href: '/privacy', label: 'سياسة الخصوصية' },
                { href: '/terms', label: 'شروط الاستخدام' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-4">تواصل معنا</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <FiMapPin size={14} className="mt-1 shrink-0 text-primary-400" />
                <span>دمشق، سوريا — شارع المعرض</span>
              </li>
              <li className="flex items-center gap-2">
                <FiPhone size={14} className="shrink-0 text-primary-400" />
                <span dir="ltr">+963 11 XXX XXXX</span>
              </li>
              <li className="flex items-center gap-2">
                <FiMail size={14} className="shrink-0 text-primary-400" />
                <span>info@techstore-syria.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payment Methods Bar */}
      <div className="border-t border-slate-800 py-4">
        <div className="container-main flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>طرق الدفع المتاحة: الدفع عند الاستلام | سيريتل كاش | MTN كاش</p>
          <p>© {year} TechStore Syria. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
