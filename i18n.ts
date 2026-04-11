import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Supported locales
export const locales = ['ar', 'en'] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = 'ar';

export default getRequestConfig(async ({ requestLocale }) => {
  // Await the locale from the request params
  let locale = await requestLocale;

  // If locale is missing or invalid, fall back or notFound
  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    locale: locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
