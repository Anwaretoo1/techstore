import type { Metadata } from 'next';
import Link from 'next/link';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'الأسئلة الشائعة | TechStore Syria',
  description: 'إجابات على أكثر الأسئلة شيوعاً حول التسوق في TechStore Syria',
};

const faqs = [
  {
    category: '🛒 الطلبات والشراء',
    items: [
      { q: 'كيف أقوم بعملية الشراء?', a: 'تصفح المنتجات، أضف ما تريده إلى السلة، ثم انتقل إلى صفحة الدفع وأدخل بيانات الشحن واختر طريقة الدفع المناسبة.' },
      { q: 'هل يمكنني إلغاء طلبي بعد تأكيده?', a: 'يمكن إلغاء الطلب خلال 12 ساعة من تأكيده ما لم يكن قد شُحن بالفعل. تواصل معنا عبر واتساب أو البريد الإلكتروني.' },
      { q: 'هل يمكنني تعديل طلبي بعد تأكيده?', a: 'يمكن تعديل الطلب خلال ساعات قليلة من تقديمه. تواصل معنا فوراً عبر واتساب لنتمكن من المساعدة.' },
      { q: 'هل تتوفر فواتير رسمية?', a: 'نعم، نصدر فاتورة إلكترونية مع كل طلب ترسل إلى بريدك الإلكتروني تلقائياً.' },
    ],
  },
  {
    category: '🚚 الشحن والتوصيل',
    items: [
      { q: 'ما هي مناطق التوصيل المتاحة?', a: 'نوصل إلى جميع المحافظات السورية: دمشق، حلب، حمص، حماة، اللاذقية، طرطوس، دير الزور وغيرها.' },
      { q: 'كم تستغرق عملية التوصيل?', a: 'دمشق وريفها: 1-2 يوم عمل. باقي المحافظات: 3-5 أيام عمل.' },
      { q: 'كم تبلغ تكلفة الشحن?', a: 'الشحن المجاني للطلبات التي تتجاوز 500$. الطلبات الأقل تخضع لرسوم شحن 25$ يتم احتسابها عند الدفع.' },
      { q: 'كيف أتابع طلبي?', a: 'بعد شحن طلبك سترسل رسالة على واتساب أو بريدك الإلكتروني تحتوي على رقم التتبع.' },
    ],
  },
  {
    category: '💳 الدفع',
    items: [
      { q: 'ما هي طرق الدفع المتاحة?', a: 'نقبل: الدفع عند الاستلام (كاش)، سيريتل كاش، MTN كاش، وشام كاش.' },
      { q: 'هل بياناتي المالية آمنة?', a: 'نعم، لا نحتفظ بأي بيانات بطاقات مصرفية. الدفع النقدي والمحافظ الإلكترونية هي الطرق المتاحة حالياً.' },
      { q: 'هل يمكن الدفع بالتقسيط?', a: 'نعمل على توفير خيار التقسيط قريباً. تابعنا على وسائل التواصل الاجتماعي للاطلاع على آخر العروض.' },
    ],
  },
  {
    category: '🔄 الإرجاع والاستبدال',
    items: [
      { q: 'ما هي سياسة الإرجاع?', a: 'نقبل الإرجاع خلال 7 أيام من استلام المنتج إذا كان بحالته الأصلية ومع كامل محتويات العبوة.' },
      { q: 'كيف أبدأ عملية الإرجاع?', a: 'تواصل مع خدمة العملاء عبر واتساب أو البريد الإلكتروني مع صور للمنتج وسبب الإرجاع.' },
      { q: 'هل تُرجع تكاليف الشحن عند الإرجاع?', a: 'إذا كان الإرجاع بسبب عيب في المنتج أو خطأ منا، نتكفل برسوم الشحن. إذا كان بسبب تغير الرأي فتكون على عاتق العميل.' },
      { q: 'ما هي المنتجات غير القابلة للإرجاع?', a: 'البرامج والتراخيص الرقمية بعد تفعيلها، والمنتجات المفتوحة التي تعذّر التحقق من سلامتها.' },
    ],
  },
  {
    category: '🛠️ الضمان والدعم الفني',
    items: [
      { q: 'ما هي مدة الضمان?', a: 'جميع منتجاتنا تأتي بضمان رسمي من الوكيل. تتراوح مدة الضمان بين سنة و3 سنوات حسب نوع المنتج.' },
      { q: 'ماذا يشمل الضمان?', a: 'يشمل عيوب الصناعة والأعطال التقنية. لا يشمل الكسر والإتلاف الناتج عن سوء الاستخدام أو الماء.' },
      { q: 'هل تقدمون دعماً فنياً?', a: 'نعم، يمكنك التواصل مع فريقنا الفني عبر واتساب أو زيارة مركز الخدمة في دمشق.' },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="container-main py-10 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-primary-600">الرئيسية</Link>
        <FiChevronRight size={14} className="icon-flip" />
        <span className="text-slate-800 font-medium">الأسئلة الشائعة</span>
      </nav>

      <div className="mb-8 text-center">
        <h1 className="section-title">الأسئلة الشائعة</h1>
        <p className="section-subtitle">إجابات شاملة على أكثر تساؤلاتكم شيوعاً</p>
      </div>

      <div className="space-y-8">
        {faqs.map((section) => (
          <div key={section.category}>
            <h2 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">
              {section.category}
            </h2>
            <div className="space-y-3">
              {section.items.map((item) => (
                <details key={item.q} className="group card p-0 overflow-hidden">
                  <summary className="flex items-center justify-between gap-3 p-4 cursor-pointer font-semibold text-slate-800 hover:bg-slate-50 transition-colors list-none">
                    <span>{item.q}</span>
                    <FiChevronDown size={18} className="shrink-0 text-slate-400 group-open:rotate-180 transition-transform duration-200" />
                  </summary>
                  <p className="px-4 pb-4 text-slate-600 text-sm leading-relaxed">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-10 bg-primary-50 border border-primary-100 rounded-2xl p-8 text-center">
        <h3 className="font-bold text-primary-800 text-lg mb-2">لم تجد إجابة على سؤالك؟</h3>
        <p className="text-primary-700 text-sm mb-4">فريقنا جاهز للمساعدة في أي وقت</p>
        <Link href="/contact" className="btn-primary">تواصل معنا</Link>
      </div>
    </div>
  );
}
