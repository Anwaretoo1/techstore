'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FiShoppingCart, FiSearch, FiUser, FiMenu, FiX, FiChevronDown, FiLogOut
} from 'react-icons/fi';
import { useCartStore, useAuthStore, useUIStore } from '@/lib/store';
import { authApi } from '@/lib/api';
import Cookies from 'js-cookie';
import CartDrawer from '@/components/cart/CartDrawer';
import SearchModal from '@/components/ui/SearchModal';

export default function Header() {
  const router = useRouter();
  const itemCount = useCartStore((s) => s.itemCount());
  const { user, isAuthenticated, logout } = useAuthStore();
  const { isMobileMenuOpen, isCartOpen, isSearchOpen, toggleMobileMenu, toggleCart, toggleSearch, closeAll } = useUIStore();
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    authApi.logout();
    logout();
    setUserMenuOpen(false);
    router.push('/');
  };

  const navLinks = [
    { href: '/products', label: 'المنتجات' },
    { href: '/products?category=laptops', label: 'لابتوبات' },
    { href: '/products?category=desktops', label: 'ديسكتوب' },
    { href: '/products?category=accessories', label: 'ملحقات' },
    { href: '/contact', label: 'تواصل معنا' },
  ];

  return (
    <>
      <header className={`sticky top-0 z-40 bg-white transition-shadow duration-200 ${scrolled ? 'shadow-md' : 'border-b border-slate-200'}`}>
        {/* Top Bar */}
        <div className="bg-primary-700 text-white text-xs py-1.5 text-center">
          <span>شحن مجاني للطلبات فوق 500,000 ل.س | الدفع عند الاستلام متاح</span>
        </div>

        {/* Main Header */}
        <div className="container-main">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0" onClick={closeAll}>
              <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TS</span>
              </div>
              <div className="hidden sm:block">
                <p className="font-bold text-primary-700 text-lg leading-none">TechStore</p>
                <p className="text-xs text-slate-500">سوريا</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <button
                onClick={toggleSearch}
                className="p-2 text-slate-600 hover:text-primary-600 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="بحث"
              >
                <FiSearch size={20} />
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-2 text-slate-600 hover:text-primary-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <FiUser size={20} />
                  {isAuthenticated && (
                    <span className="hidden sm:block text-xs font-medium">{user?.first_name}</span>
                  )}
                </button>

                {userMenuOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 animate-slide-down z-50">
                    {isAuthenticated ? (
                      <>
                        <Link href="/account" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setUserMenuOpen(false)}>
                          <FiUser size={14} />حسابي
                        </Link>
                        <Link href="/account/orders" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setUserMenuOpen(false)}>
                          طلباتي
                        </Link>
                        {user?.role === 'admin' && (
                          <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-primary-600 hover:bg-primary-50" onClick={() => setUserMenuOpen(false)}>
                            لوحة التحكم
                          </Link>
                        )}
                        <hr className="my-1 border-slate-100" />
                        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-right">
                          <FiLogOut size={14} />تسجيل الخروج
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/auth/login" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setUserMenuOpen(false)}>تسجيل الدخول</Link>
                        <Link href="/auth/register" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setUserMenuOpen(false)}>إنشاء حساب</Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Cart */}
              <button
                onClick={toggleCart}
                className="relative p-2 text-slate-600 hover:text-primary-600 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="السلة"
              >
                <FiShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-0.5">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>

              {/* Mobile menu */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 animate-slide-down">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg mb-0.5"
                onClick={closeAll}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={() => useUIStore.getState().closeAll()} />
      <SearchModal isOpen={isSearchOpen} onClose={toggleSearch} />
    </>
  );
}
