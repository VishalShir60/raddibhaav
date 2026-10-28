'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useAuth } from '@/hooks/useAuth';
import { 
  Recycle, 
  Store, 
  PlusCircle, 
  TrendingUp, 
  Calculator, 
  Menu, 
  X,
  Radio,
  User,
  LogIn,
  Sun,
  Moon,
  ShieldCheck
} from 'lucide-react';

export function Header() {
  const t = useTranslations();
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const { user, profile } = useAuth();

  useEffect(() => {
    try {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    } catch (_) {}
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('raddibhaav_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('raddibhaav_theme', 'light');
    }
  };

  const switchLanguage = (newLocale: 'en' | 'hi' | 'mr') => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-surface/90 dark:bg-surface/95 backdrop-blur-md border-b border-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0 focus:outline-hidden">
          <div className="w-11 h-11 rounded-[14px] bg-primary text-white flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
            <Recycle className="w-6 h-6 text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-2xl tracking-tight text-text">
                Raddi<span className="text-primary dark:text-accent font-sans font-bold">Bhaav</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-primary-tint text-primary dark:text-accent border border-primary/20">
                Verified
              </span>
            </div>
            <p className="text-[11px] text-muted -mt-0.5 hidden sm:block font-medium">
              {currentLocale === 'hi' ? 'कबाड़ का सही भाव • निष्पक्ष डिजिटल तुलाई' : currentLocale === 'mr' ? 'भंगाराचा योग्य भाव • पारदर्शक डिजिटल वजन' : 'Fair Scrap Pricing • Guaranteed Weigh-in'}
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold text-muted">
          <Link
            href="/"
            className={`px-3.5 py-2 rounded-xl transition-all ${
              pathname === '/' 
                ? 'text-primary dark:text-accent bg-primary-tint/60 font-bold' 
                : 'hover:text-text hover:bg-muted-bg/50'
            }`}
          >
            {t('nav.home')}
          </Link>
          <Link
            href="/rates"
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              pathname === '/rates' 
                ? 'text-primary dark:text-accent bg-primary-tint/60 font-bold' 
                : 'hover:text-text hover:bg-muted-bg/50'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-accent" />
            {t('nav.mandiRates')}
          </Link>
          <Link
            href="/calculator"
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              pathname === '/calculator' 
                ? 'text-primary dark:text-accent bg-primary-tint/60 font-bold' 
                : 'hover:text-text hover:bg-muted-bg/50'
            }`}
          >
            <Calculator className="w-4 h-4" />
            {t('nav.calculator')}
          </Link>
          <Link
            href="/bids"
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              pathname.startsWith('/bids') 
                ? 'text-primary dark:text-accent bg-primary-tint/60 font-bold' 
                : 'hover:text-text hover:bg-muted-bg/50'
            }`}
          >
            <Radio className="w-4 h-4 text-accent animate-pulse" />
            {t('nav.myListings')}
          </Link>
          <Link
            href="/dealer"
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              pathname === '/dealer' 
                ? 'text-primary dark:text-accent bg-primary-tint/60 font-bold' 
                : 'hover:text-text hover:bg-muted-bg/50'
            }`}
          >
            <Store className="w-4 h-4" />
            {t('nav.dealerHub')}
          </Link>
        </nav>

        {/* Right Actions: Dark Mode, Language Switcher, Auth, Sell CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="min-h-[48px] min-w-[48px] rounded-[14px] border border-border bg-surface hover:bg-muted-bg/60 text-muted hover:text-text flex items-center justify-center transition-all focus:outline-hidden"
            aria-label={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-accent" /> : <Moon className="w-5 h-5 text-muted" />}
          </button>

          {/* Language Switcher Buttons (EN / हिं / मरा) with 48px min touch target */}
          <div className="flex items-center bg-muted-bg p-1 rounded-[14px] border border-border text-xs font-semibold">
            <button
              onClick={() => switchLanguage('en')}
              className={`min-h-[44px] min-w-[40px] px-2.5 py-1.5 rounded-[10px] transition-all flex items-center justify-center ${
                currentLocale === 'en'
                  ? 'bg-surface text-primary dark:text-accent shadow-xs font-bold'
                  : 'text-muted hover:text-text'
              }`}
              aria-label="EN - Switch language to English"
            >
              EN
            </button>
            <button
              onClick={() => switchLanguage('hi')}
              className={`min-h-[44px] min-w-[40px] px-2.5 py-1.5 rounded-[10px] transition-all flex items-center justify-center ${
                currentLocale === 'hi'
                  ? 'bg-surface text-primary dark:text-accent shadow-xs font-bold'
                  : 'text-muted hover:text-text'
              }`}
              aria-label="हिं - हिंदी भाषा चुनें"
            >
              हिं
            </button>
            <button
              onClick={() => switchLanguage('mr')}
              className={`min-h-[44px] min-w-[40px] px-2.5 py-1.5 rounded-[10px] transition-all flex items-center justify-center ${
                currentLocale === 'mr'
                  ? 'bg-surface text-primary dark:text-accent shadow-xs font-bold'
                  : 'text-muted hover:text-text'
              }`}
              aria-label="मरा - मराठी भाषा निवडा"
            >
              मरा
            </button>
          </div>

          {/* User Profile Chip or Login Button */}
          {user ? (
            <Link
              href="/profile"
              className="min-h-[48px] px-3 py-1.5 rounded-[14px] border border-border hover:border-primary bg-surface hover:bg-primary-tint/30 flex items-center gap-2.5 transition-all"
            >
              <div className="w-8 h-8 rounded-[10px] bg-primary text-white flex items-center justify-center text-xs font-bold">
                {profile?.name ? profile.name.slice(0, 2).toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-text leading-tight">
                  {profile?.name ? profile.name.split(' ')[0] : 'Account'}
                </div>
                <div className="text-[10px] text-muted font-medium capitalize">
                  {profile?.role === 'dealer' ? 'Dealer Partner' : 'Household Seller'}
                </div>
              </div>
            </Link>
          ) : (
            <Link
              href="/login"
              className="btn-outline min-h-[48px] text-xs sm:text-sm px-4 py-2"
            >
              <LogIn className="w-4 h-4 text-primary dark:text-accent" />
              <span>{t('auth.loginTitle').split(' ')[0]}</span>
            </Link>
          )}

          {/* Sell Scrap CTA */}
          <Link
            href="/sell"
            className="btn-primary hidden sm:inline-flex min-h-[48px] text-xs sm:text-sm px-4 sm:px-5 py-2.5"
          >
            <PlusCircle className="w-4 h-4 text-accent" />
            <span>{t('nav.sellScrap')}</span>
          </Link>

          {/* Mobile menu button with min 48px target */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden min-h-[48px] min-w-[48px] flex items-center justify-center rounded-[14px] text-text hover:bg-muted-bg border border-border transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-surface px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2">
          {user ? (
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3.5 rounded-[14px] bg-muted-bg border border-border text-text font-bold"
            >
              <div className="w-10 h-10 rounded-[10px] bg-primary text-white flex items-center justify-center font-bold">
                {profile?.name ? profile.name.slice(0, 2).toUpperCase() : <User className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-sm font-bold text-text">{profile?.name || 'My Profile'}</div>
                <div className="text-xs text-muted font-normal">{user.phone} • {profile?.role || 'User'}</div>
              </div>
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 p-3.5 rounded-[14px] bg-primary-tint text-primary font-bold text-sm min-h-[48px]"
            >
              <LogIn className="w-4 h-4 text-primary" />
              <span>{t('auth.loginTitle')}</span>
            </Link>
          )}

          <div className="space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-text font-semibold hover:bg-muted-bg"
            >
              {t('nav.home')}
            </Link>
            <Link
              href="/rates"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-text font-semibold hover:bg-muted-bg"
            >
              <TrendingUp className="w-4 h-4 text-accent" />
              {t('nav.mandiRates')}
            </Link>
            <Link
              href="/calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-text font-semibold hover:bg-muted-bg"
            >
              <Calculator className="w-4 h-4 text-muted" />
              {t('nav.calculator')}
            </Link>
            <Link
              href="/bids"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-text font-semibold hover:bg-muted-bg"
            >
              <Radio className="w-4 h-4 text-accent" />
              {t('nav.myListings')}
            </Link>
            <Link
              href="/dealer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-text font-semibold hover:bg-muted-bg"
            >
              <Store className="w-4 h-4 text-primary dark:text-accent" />
              {t('nav.dealerHub')}
            </Link>
          </div>

          <div className="pt-2">
            <Link
              href="/sell"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-accent" />
              <span>{t('nav.sellScrap')}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
