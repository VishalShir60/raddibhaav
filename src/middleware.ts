import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { createServerClient } from '@supabase/ssr';

const intlMiddleware = createMiddleware(routing);

// Routes requiring specific authorization
const SELLER_ROUTES = ['/sell', '/bids'];
const DEALER_ROUTES = ['/dealer'];
const ADMIN_ROUTES = ['/admin'];
const AUTH_REQUIRED_ROUTES = [...SELLER_ROUTES, ...DEALER_ROUTES, ...ADMIN_ROUTES, '/profile'];

export default async function middleware(request: NextRequest) {
  // 1. Run next-intl middleware first to resolve locale and pathname
  const response = intlMiddleware(request);

  const pathname = request.nextUrl.pathname;

  // Extract the route without the locale prefix (e.g. '/en/sell' -> '/sell')
  const localeMatch = pathname.match(/^\/(en|hi|mr)(\/.*)?$/);
  const currentLocale = localeMatch ? localeMatch[1] : 'en';
  const pathWithoutLocale = localeMatch ? (localeMatch[2] || '/') : pathname;

  // Check if current path requires authentication
  const isAuthRequired = AUTH_REQUIRED_ROUTES.some((route) => 
    pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
  );

  if (!isAuthRequired) {
    return response;
  }

  // 2. Inspect session via Supabase SSR client or local dev mock cookies
  let isAuthenticated = false;
  let userRole: string | null = null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseLive = Boolean(
    url && anonKey && !url.includes('your-project') && !anonKey.includes('your-anon-key')
  );

  if (isSupabaseLive) {
    try {
      const supabase = createServerClient(url!, anonKey!, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              response.cookies.set(name, value, options);
            });
          },
        },
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        isAuthenticated = true;
        // Check cached role cookie first for low-latency
        const roleCookie = request.cookies.get('raddibhaav_user_role')?.value;
        if (roleCookie) {
          userRole = roleCookie;
        } else {
          // Fallback query to profiles
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          const userProf = profile as { role?: string } | null;
          if (userProf?.role) {
            userRole = userProf.role;
            response.cookies.set('raddibhaav_user_role', userProf.role, {
              path: '/',
              maxAge: 86400 * 30,
            });
          }
        }
      }
    } catch (err) {
      console.warn('Middleware auth verification fallback:', err);
    }
  }

  // Local/Offline mock mode fallback
  if (!isAuthenticated) {
    const mockSession = request.cookies.get('raddibhaav_session')?.value;
    const mockRole = request.cookies.get('raddibhaav_user_role')?.value;
    if (mockSession && mockRole) {
      isAuthenticated = true;
      userRole = mockRole;
    }
  }

  // 3. Enforce Route Protection
  // If not authenticated, redirect to /auth with redirect query param
  if (!isAuthenticated) {
    const loginUrl = new URL(`/${currentLocale}/auth`, request.url);
    loginUrl.searchParams.set('redirect', pathWithoutLocale);
    return NextResponse.redirect(loginUrl);
  }

  // Admin route check: only 'admin' role permitted
  const isAdminRoute = ADMIN_ROUTES.some((route) => 
    pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
  );
  if (isAdminRoute && userRole !== 'admin') {
    const forbiddenUrl = new URL(`/${currentLocale}`, request.url);
    forbiddenUrl.searchParams.set('error', 'admin_required');
    return NextResponse.redirect(forbiddenUrl);
  }

  // Dealer route check: 'dealer' or 'admin' permitted
  const isDealerRoute = DEALER_ROUTES.some((route) => 
    pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
  );
  if (isDealerRoute && userRole !== 'dealer' && userRole !== 'admin') {
    const onboardingUrl = new URL(`/${currentLocale}/onboarding`, request.url);
    onboardingUrl.searchParams.set('role', 'dealer');
    return NextResponse.redirect(onboardingUrl);
  }

  // Seller route check: 'seller' or 'admin' permitted
  const isSellerRoute = SELLER_ROUTES.some((route) => 
    pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
  );
  if (isSellerRoute && userRole !== 'seller' && userRole !== 'admin') {
    const onboardingUrl = new URL(`/${currentLocale}/onboarding`, request.url);
    onboardingUrl.searchParams.set('role', 'seller');
    return NextResponse.redirect(onboardingUrl);
  }

  return response;
}

export const config = {
  // Match all request paths except _next, static assets, and api
  matcher: ['/', '/(en|hi|mr)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
