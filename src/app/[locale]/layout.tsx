import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ThemeProvider } from '@/src/shared/ui/providers/theme-provider';
import { Navbar } from '@/src/shared/ui/layout/navbar';
import { Footer } from '@/src/shared/ui/layout/footer';
import { getContactSettings } from '@/src/shared/api/public';
import '@/src/app/globals.css';

export default async function LocaleLayout(
  props: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    locale
  } = params;

  const {
    children
  } = props;

  const messages = await getMessages();
  const contactSettings = await getContactSettings(locale);

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground selection:bg-gold selection:text-black">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            <main className="relative flex flex-col min-h-screen">
              {children}
            </main>
            <Footer contactSettings={contactSettings} />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}