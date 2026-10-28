'use client';

import { usePathname, Link } from '@/i18n/routing';
import { useAuth } from '@/hooks/useAuth';
import { 
  Home, 
  PlusCircle, 
  TrendingUp, 
  Clock, 
  User, 
  Store,
  Layers
} from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();
  const { profile, dealer } = useAuth();
  const isDealer = profile?.role === 'dealer' || Boolean(dealer);

  const navItems = isDealer
    ? [
        { href: '/dealer', label: 'Hub', icon: Store, active: pathname === '/dealer' },
        { href: '/dealer', label: 'Won', icon: Clock, active: pathname.includes('/dealer?tab=won') },
        { href: '/rates', label: 'Rates', icon: TrendingUp, active: pathname === '/rates' },
        { href: '/profile', label: 'Account', icon: User, active: pathname === '/profile' },
      ]
    : [
        { href: '/', label: 'Home', icon: Home, active: pathname === '/' },
        { href: '/sell', label: 'Sell Scrap', icon: PlusCircle, active: pathname === '/sell', highlight: true },
        { href: '/bids', label: 'Live Bids', icon: Layers, active: pathname.startsWith('/bids') },
        { href: '/rates', label: 'Rates', icon: TrendingUp, active: pathname === '/rates' },
        { href: '/profile', label: 'Profile', icon: User, active: pathname === '/profile' },
      ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border shadow-[0_-4px_20px_rgba(15,61,46,0.06)]"
    >
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isHigh = item.highlight;

          if (isHigh) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="relative -top-3 flex flex-col items-center justify-center min-w-[54px] min-h-[54px] rounded-full bg-primary hover:bg-primary-hover text-white shadow-[0_6px_20px_rgba(15,61,46,0.35)] active:scale-95 transition-all focus:outline-hidden"
              >
                <Icon className="w-6 h-6" />
                <span className="sr-only">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-semibold transition-colors min-h-[48px] ${
                item.active
                  ? 'text-primary dark:text-accent font-bold'
                  : 'text-muted hover:text-text'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${item.active ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span>{item.label}</span>
              {item.active && (
                <span className="w-1 h-1 rounded-full bg-primary dark:bg-accent mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
