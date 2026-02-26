import type { Metadata } from 'next';
import Link from 'next/link';
import { FiChevronRight } from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | TechStore Syria',
  description: 'سياسة الخصوصية وحماية البيانات في TechStore Syria',
};

export default function PrivacyPage() {
  return (
    <div className="container-main py-10 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-primary-600">الرئيسية</Link>
        <FiChevronRight size={14} className="icon-flip" />
        <span className="text-slate-800 font-medium">سياسة الخصوصية</span>
      </nav>

      <h1 className="section-title mb-2">سياسة الخصوصية</h1>
      <p className="text-sm text-slate-500 mb-8">آخر تحديث: فبراير 2026</p>

      <div className="card p-8 space-y-8 text-slate-700 leading-relaxed">

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">١. مقدمة</h2>
          <p>
            نحن في <strong>TechStore Syria</strong> نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيفية جمع بياناتك واستخدامها والحفاظ عليها عند استخدامك لموقعنا الإلكتروني أو خدماتنا.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">٢. البيانات التي نجمعها</h2>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li><strong>بيانات الحساب:</strong> الاسم، البريد الإلكتروني، رقم الهاتف، وكلمة المرور المشفرة.</li>
            <li><strong>بيانات الطلبات:</strong> عنوان التوصيل، المنتجات المشتراة، ومعلومات الدفع (الدفع عند الاستلام أو المحافظ الإلكترونية).</li>
            <li><strong>بيانات التصفح:</strong> الصفحات التي تزورها وعمليات البحث لتحسين تجربتك.</li>
            <li><strong>بيانات الجهاز:</strong> نوع المتصفح، نظام التشغيل، وعنوان IP.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">٣. كيف نستخدم بياناتك</h2>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>معالجة وتتبع طلباتك والتواصل معك بشأنها.</li>
            <li>إنشاء وإدارة حسابك على الموقع.</li>
            <li>إرسال تأكيدات الطلبات والإشعارات الهامة.</li>
            <li>تحسين خدماتنا ومنتجاتنا بناءً على سلوك التصفح.</li>
            <li>إرسال عروض وتخفيضات (بموافقتك فقط وبإمكانك إلغاء الاشتراك).</li>
            <li>الامتثال للمتطلبات القانونية.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">٤. مشاركة البيانات</h2>
          <p className="text-sm mb-2">
            لا نبيع بياناتك الشخصية لأي طرف ثالث. قد نشارك بياناتك مع:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li><strong>شركاء التوصيل:</strong> لغرض توصيل طلباتك فقط.</li>
            <li><strong>مزودي الخدمة التقنية:</strong> مثل الاستضافة السحابية لتشغيل الموقع.</li>
            <li><strong>الجهات القانونية:</strong> عند الطلب الرسمي من الجهات المختصة.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">٥. حماية البيانات</h2>
          <p className="text-sm">
            نستخدم تشفير SSL لنقل البيانات بأمان. يتم تخزين كلمات المرور بشكل مشفر ولا يمكن الاطلاع عليها حتى من قِبلنا. نحد من الوصول إلى البيانات الشخصية على العاملين المخولين فقط.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">٦. ملفات الارتباط (Cookies)</h2>
          <p className="text-sm">
            نستخدم ملفات تعريف الارتباط لتحسين تجربتك، مثل حفظ محتويات سلة التسوق وتسجيل الدخول. يمكنك تعطيل هذه الملفات من إعدادات متصفحك، مع العلم أن ذلك قد يؤثر على بعض وظائف الموقع.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">٧. حقوقك</h2>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>الوصول إلى بياناتك الشخصية المحفوظة لدينا.</li>
            <li>تصحيح أي بيانات غير دقيقة.</li>
            <li>طلب حذف حسابك وبياناتك.</li>
            <li>إلغاء الاشتراك في الرسائل التسويقية في أي وقت.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">٨. التواصل بشأن الخصوصية</h2>
          <p className="text-sm">
            لأي استفسارات تتعلق بخصوصيتك أو لممارسة حقوقك، تواصل معنا عبر:
            <br />
            البريد الإلكتروني: <strong>privacy@techstore-syria.com</strong>
            <br />
            أو من خلال <Link href="/contact" className="text-primary-600 hover:underline">صفحة التواصل</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">٩. تغييرات على هذه السياسة</h2>
          <p className="text-sm">
            نحتفظ بحق تعديل هذه السياسة في أي وقت. سيتم إشعارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار ظاهر على الموقع. استمرار استخدامك للموقع بعد التعديل يعني موافقتك على السياسة المحدثة.
          </p>
        </section>

      </div>
    </div>
  );
}
