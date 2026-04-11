import { cookies } from 'next/headers';
import { defaultLocale, type Locale } from '@/i18n';

/**
 * Get the user's preferred locale from cookies
 */
export function getLocaleFromCookie(): Locale | null {
  const cookieStore = (cookies() as any);
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  return localeCookie?.value as Locale | null;
}

/**
 * Set the user's preferred locale in cookies
 * This is a client-side function
 */
export function setLocaleCookie(locale: Locale): void {
  if (typeof document !== 'undefined') {
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  }
}

/**
 * Get the locale from the request or fall back to default
 */
export function getLocale(requestLocale?: string): Locale {
  if (requestLocale && (requestLocale === 'ar' || requestLocale === 'en')) {
    return requestLocale as Locale;
  }
  return getLocaleFromCookie() || defaultLocale;
}

