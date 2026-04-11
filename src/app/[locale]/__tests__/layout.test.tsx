/**
 * Tests for Task 20.1: Public Site Root Layout
 * Requirements: 10.2, 10.3, 11.3
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

// Mock next-intl/server
jest.mock('next-intl/server', () => ({
  getMessages: jest.fn().mockResolvedValue({}),
  getRequestConfig: jest.fn(),
}));

// Mock i18n config
jest.mock('@/i18n', () => ({
  locales: ['ar', 'en'],
  defaultLocale: 'ar',
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  usePathname: () => '/en',
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe('Task 20.1: Public Site Root Layout', () => {
  describe('Locale-based routing structure', () => {
    it('should accept valid locale parameter', async () => {
      const LocaleLayout = (await import('../layout')).default;
      const { notFound } = require('next/navigation');
      
      render(
        <LocaleLayout params={{ locale: 'en' }}>
          <div>Test Content</div>
        </LocaleLayout>
      );

      expect(notFound).not.toHaveBeenCalled();
    });

    it('should call notFound for invalid locale', async () => {
      const LocaleLayout = (await import('../layout')).default;
      const { notFound } = require('next/navigation');
      
      render(
        <LocaleLayout params={{ locale: 'invalid' }}>
          <div>Test Content</div>
        </LocaleLayout>
      );

      expect(notFound).toHaveBeenCalled();
    });

    it('should set RTL direction for Arabic locale', async () => {
      const LocaleLayout = (await import('../layout')).default;
      
      const { container } = render(
        <LocaleLayout params={{ locale: 'ar' }}>
          <div>Test Content</div>
        </LocaleLayout>
      );

      const html = container.querySelector('html');
      expect(html).toHaveAttribute('dir', 'rtl');
      expect(html).toHaveAttribute('lang', 'ar');
    });

    it('should set LTR direction for English locale', async () => {
      const LocaleLayout = (await import('../layout')).default;
      
      const { container } = render(
        <LocaleLayout params={{ locale: 'en' }}>
          <div>Test Content</div>
        </LocaleLayout>
      );

      const html = container.querySelector('html');
      expect(html).toHaveAttribute('dir', 'ltr');
      expect(html).toHaveAttribute('lang', 'en');
    });
  });

  describe('Provider integration', () => {
    it('should wrap children with NextIntlClientProvider', async () => {
      const LocaleLayout = (await import('../layout')).default;
      
      render(
        <LocaleLayout params={{ locale: 'en' }}>
          <div data-testid="test-content">Test Content</div>
        </LocaleLayout>
      );

      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    it('should include ThemeProvider in component tree', async () => {
      const LocaleLayout = (await import('../layout')).default;
      
      const { container } = render(
        <LocaleLayout params={{ locale: 'en' }}>
          <div>Test Content</div>
        </LocaleLayout>
      );

      // ThemeProvider should render its children
      expect(container.querySelector('body')).toBeInTheDocument();
    });
  });

  describe('SEO metadata', () => {
    it('should export metadata with title and description', async () => {
      const { metadata } = await import('../layout');
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBe('Leather E-Commerce Platform');
      expect(metadata.description).toBe('Premium leather products');
    });
  });

  describe('Layout structure', () => {
    it('should render Header component', async () => {
      const LocaleLayout = (await import('../layout')).default;
      
      render(
        <LocaleLayout params={{ locale: 'en' }}>
          <div>Test Content</div>
        </LocaleLayout>
      );

      // Header should be present (contains navigation)
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should render main content area', async () => {
      const LocaleLayout = (await import('../layout')).default;
      
      const { container } = render(
        <LocaleLayout params={{ locale: 'en' }}>
          <div data-testid="main-content">Main Content</div>
        </LocaleLayout>
      );

      const main = container.querySelector('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveClass('flex-1');
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
    });

    it('should render Footer component', async () => {
      const LocaleLayout = (await import('../layout')).default;
      
      const { container } = render(
        <LocaleLayout params={{ locale: 'en' }}>
          <div>Test Content</div>
        </LocaleLayout>
      );

      // Footer should be present
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });

    it('should have proper flex layout structure', async () => {
      const LocaleLayout = (await import('../layout')).default;
      
      const { container } = render(
        <LocaleLayout params={{ locale: 'en' }}>
          <div>Test Content</div>
        </LocaleLayout>
      );

      const body = container.querySelector('body');
      expect(body).toHaveClass('flex', 'flex-col', 'min-h-screen');
    });
  });

  describe('Static params generation', () => {
    it('should generate static params for all locales', async () => {
      const { generateStaticParams } = await import('../layout');
      
      const params = generateStaticParams();
      
      expect(params).toEqual([
        { locale: 'ar' },
        { locale: 'en' },
      ]);
    });
  });
});
