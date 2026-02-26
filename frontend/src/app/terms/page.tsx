import type { Metadata } from 'next';
import Link from 'next/link';
import { FiChevronRight } from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'شروط الاستخدام | TechStore Syria',
  description: 'شروط وأحكام استخدام موقع TechStore Syria',
};

export default function TermsPage() {
  return (
    <div className="container-main py-10 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-primary-600">الرئيسية</Link>
        <FiChevronRight size={14} className="icon-flip" />
        <span className="text-slate-800 font-medium">شروط الاستخدام</span>
      </nav>

      <h1 className="section-title mb-2">شروط الاستخدام</h1>
      <p className="text-sm text-slate-500 mb-8">آخر تحديث: فبراير 2026</p>

      <div className="card p-8 space-y-8 text-slate-700 leading-relaxed">

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">١. القبول بالشروط</h2>
          <p className="text-sm">
            باستخدامك لموقع <strong>TechStore Syria</strong> أو أي من خدماتنا، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام الموقع.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">٢. استخدام الموقع</h2>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>يجب أن يكون عمرك 16 سنة أو أكثر لاستخدام الموقع وإجراء عمليات الشراء.</li>
            <li>أنت مسؤول عن المحافظة على سرية بيانات حسابك.</li>
            <li>يُحظر استخدام الموقع لأغراض غير قانونية أو ضارة.</li>
            <li>يُحظر محاولة اختراق أو إتلاف أنظمة الموقع.</li>
            <li>نحتفظ بحق تعليق أو إنهاء أي حساب يخالف هذه الشروط.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">٣. الطلبات والمشتريات</h2>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>جميع الأسعار معروضة بالدولار الأمريكي وقابلة للتغيير دون إشعار مسبق.</li>
            <li>تأكيد الطلب لا يعني الالتزام النهائي بالبيع إذا تبين توقف المنتج عن التوفر.</li>
            <li>نحتفظ بحق رفض أي طلب يثير شكوكاً حول الاحتيال أو إساءة الاستخدام.</li>
            <li>الكميات محدودة وقد تتغير الأسعار في حالات نادرة قبل الشحن؛ سيتم إشعارك فوراً في هذه الحالة.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">٤. الشحن والتوصيل</h2>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>مواعيد التوصيل تقديرية وقد تتأخر بسبب ظروف خارجة عن إرادتنا.</li>
            <li>المخاطرة على المنتج تنتقل إليك عند استلامه.</li>
            <li>تأكد من فحص المنتج عند الاستلام قبل توقيع وصل الاستلام.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">٥. الإرجاع والاستبدال</h2>
          <p className="text-sm">
            نقبل الإرجاع خلال 7 أيام من الاستلام وفق <Link href="/faq" className="text-primary-600 hover:underline">سياسة الإرجاع</Link> الموضحة في الأسئلة الشائعة. يجب أن يكون المنتج بحالته الأصلية ومع كامل ملحقاته وعبوته.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">٦. الملكية الفكرية</h2>
          <p className="text-sm">
            جميع محتويات الموقع من تصميمات وصور ونصوص وشعارات هي ملك حصري لـ TechStore Syria أو مرخصة لنا. يُحظر نسخ أو إعادة استخدام أي محتوى دون إذن كتابي مسبق منا.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">٧. حدود المسؤولية</h2>
          <p className="text-sm">
            لا نتحمل المسؤولية عن أي أضرار غير مباشرة أو عرضية ناتجة عن استخدام منتجاتنا بشكل مخالف للتعليمات. مسؤوليتنا محدودة بقيمة المنتج المشترى.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">٨. التعديلات على الشروط</h2>
          <p className="text-sm">
            نحتفظ بحق تعديل هذه الشروط في أي وقت. سيتم نشر التعديلات على هذه الصفحة مع تحديث تاريخ آخر تعديل. استمرار استخدامك للموقع بعد التعديل يُعدّ موافقة ضمنية منك.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">٩. القانون المطبّق</h2>
          <p className="text-sm">
            تخضع هذه الشروط وتُفسَّر وفق أحكام القوانين السارية في الجمهورية العربية السورية.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">١٠. التواصل معنا</h2>
          <p className="text-sm">
            لأي استفسارات تتعلق بهذه الشروط، تواصل معنا عبر <Link href="/contact" className="text-primary-600 hover:underline">صفحة التواصل</Link> أو عبر البريد الإلكتروني:
            <strong> legal@techstore-syria.com</strong>
          </p>
        </section>

      </div>
    </div>
  );
}
