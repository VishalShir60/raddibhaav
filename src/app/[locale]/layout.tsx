import type { Metadata, Viewport } from 'next';
import { Fraunces, Plus_Jakarta_Sans, Noto_Sans_Devanagari } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { MockNoticeBanner } from '@/components/common/MockNoticeBanner';
import { OfflineSyncBanner } from '@/components/common/OfflineSyncBanner';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { Analytics } from '@vercel/analytics/react';
import '../globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-devanagari',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'RaddiBhaav - Hyperlocal Scrap Marketplace',
  description: 'Kabadi ka sahi bhaav! Upload scrap photos & weight. Verified nearby kabadiwalas submit competing bids. Pick the best offer, dealer weighs at your doorstep, and pays directly via Cash or UPI.',
  applicationName: 'RaddiBhaav',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'RaddiBhaav - Kabadi ka sahi bhaav',
    description: 'Sell scrap at maximum rates. Verified kabadiwalas compete for your raddi. 100% free for households.',
    url: 'https://raddibhaav.in',
    siteName: 'RaddiBhaav',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RaddiBhaav - Hyperlocal Scrap Marketplace',
    description: 'Kabadi ka sahi bhaav! Sell scrap directly to competing verified dealers.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#0F3D2E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`h-full ${fraunces.variable} ${plusJakartaSans.variable} ${notoSansDevanagari.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RaddiBhaav" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('raddibhaav_theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-text font-sans antialiased selection:bg-primary-tint selection:text-primary transition-colors duration-200">
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <OfflineSyncBanner />
            <MockNoticeBanner />
            <Header />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-24 md:pb-12">
              {children}
            </main>
            <BottomNav />
            <Footer />
            <Analytics />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
