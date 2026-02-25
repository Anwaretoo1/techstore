import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import AuthProvider from '@/components/providers/AuthProvider';

export const metadata: Metadata = {
  title: 'TechStore Syria | متجر تيك ستور سوريا',
  description: 'أفضل متجر إلكتروني لمعدات الكمبيوتر وملحقاته في سوريا — لابتوبات، شاشات، معالجات، كروت شاشة وأكثر',
  keywords: 'كمبيوتر سوريا, لابتوب, معدات كمبيوتر, شراء اونلاين سوريا',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-surface">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <WhatsAppButton />
          <Toaster
            position="bottom-left"
            toastOptions={{
              duration: 3000,
              style: {
                fontFamily: 'Cairo, sans-serif',
                direction: 'rtl',
                fontSize: '14px',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
