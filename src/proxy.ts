import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from '../i18n';

// Create the next-intl middleware with locale detection from cookies
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true,
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip locale handling for admin routes, API routes, and static files
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    /\.(png|jpg|jpeg|gif|svg|webp|ico)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Check for locale cookie
  const localeCookie = request.cookies.get('NEXT_LOCALE');
  
  // If we have a locale cookie and the path doesn't start with a locale
  if (localeCookie && !locales.some(locale => pathname.startsWith(`/${locale}`))) {
    const locale = localeCookie.value;
    if (locales.includes(locale as any)) {
      // Redirect to the path with the locale prefix
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}${pathname}`;
      return NextResponse.redirect(url);
    }
  }

  // Apply next-intl middleware for public routes
  const response = intlMiddleware(request);
  
  // Preserve the locale cookie in the response
  if (localeCookie) {
    response.cookies.set('NEXT_LOCALE', localeCookie.value, {
      path: '/',
      maxAge: 31536000,
      sameSite: 'lax',
    });
  }
  
  return response;
}

export const config = {
  // Match all pathnames except for
  // - API routes
  // - _next (Next.js internals)
  // - Static files
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
