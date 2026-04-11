import { NextRequest } from 'next/server';
import { POST } from '../route';
import { productService } from '@/src/server/services/product.service';
import { pdfService } from '@/src/server/services/pdf.service';

// Mock the services
jest.mock('@/src/server/services/product.service');
jest.mock('@/src/server/services/pdf.service');

describe('POST /api/pdf/catalog', () => {
  const mockProducts = [
    {
      id: 'prod-1',
      nameAr: 'حقيبة جلدية',
      nameEn: 'Leather Bag',
      descAr: 'حقيبة جلدية فاخرة',
      descEn: 'Premium leather bag',
      price: 150.0,
      slug: 'leather-bag',
      images: [
        { id: 'img-1', url: '/uploads/bag.jpg', alt: 'Leather bag', order: 0 },
      ],
      colors: [
        { id: 'color-1', nameAr: 'بني', nameEn: 'Brown', hexCode: '#8B4513' },
      ],
      categories: [
        { id: 'cat-1', nameAr: 'حقائب', nameEn: 'Bags', slug: 'bags' },
      ],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 'prod-2',
      nameAr: 'محفظة جلدية',
      nameEn: 'Leather Wallet',
      descAr: 'محفظة جلدية أنيقة',
      descEn: 'Elegant leather wallet',
      price: 50.0,
      slug: 'leather-wallet',
      images: [
        { id: 'img-2', url: '/uploads/wallet.jpg', alt: 'Leather wallet', order: 0 },
      ],
      colors: [
        { id: 'color-2', nameAr: 'أسود', nameEn: 'Black', hexCode: '#000000' },
      ],
      categories: [
        { id: 'cat-2', nameAr: 'محافظ', nameEn: 'Wallets', slug: 'wallets' },
      ],
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ];

  const mockPdfBuffer = Buffer.from('mock-pdf-content');

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    (productService.getAll as jest.Mock) = jest.fn().mockResolvedValue(mockProducts);
    (pdfService.generateCatalog as jest.Mock) = jest.fn().mockResolvedValue(mockPdfBuffer);
  });

  describe('Success Cases', () => {
    it('should generate PDF with all products when no productIds provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/pdf/catalog', {
        method: 'POST',
        body: JSON.stringify({ locale: 'en' }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/pdf');
      expect(response.headers.get('Content-Disposition')).toBe('attachment; filename="catalog-en.pdf"');
      expect(pdfService.generateCatalog).toHaveBeenCalledWith(mockProducts, 'en');
    });

    it('should generate PDF with Arabic locale', async () => {
      const request = new NextRequest('http://localhost:3000/api/pdf/catalog', {
        method: 'POST',
        body: JSON.stringify({ locale: 'ar' }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Disposition')).toBe('attachment; filename="catalog-ar.pdf"');
      expect(pdfService.generateCatalog).toHaveBeenCalledWith(mockProducts, 'ar');
    });

    it('should filter products by productIds when provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/pdf/catalog', {
        method: 'POST',
        body: JSON.stringify({
          productIds: ['prod-1'],
          locale: 'en',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(pdfService.generateCatalog).toHaveBeenCalledWith(
        [mockProducts[0]],
        'en'
      );
    });

    it('should filter multiple products by productIds', async () => {
      const request = new NextRequest('http://localhost:3000/api/pdf/catalog', {
        method: 'POST',
        body: JSON.stringify({
          productIds: ['prod-1', 'prod-2'],
          locale: 'en',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(pdfService.generateCatalog).toHaveBeenCalledWith(mockProducts, 'en');
    });

    it('should default to English locale when not provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/pdf/catalog', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(pdfService.generateCatalog).toHaveBeenCalledWith(mockProducts, 'en');
    });

    it('should set correct Content-Length header', async () => {
      const request = new NextRequest('http://localhost:3000/api/pdf/catalog', {
        method: 'POST',
        body: JSON.stringify({ locale: 'en' }),
      });

      const response = await POST(request);

      expect(response.headers.get('Content-Length')).toBe(mockPdfBuffer.length.toString());
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for invalid locale', async () => {
      const request = new NextRequest('http://localhost:3000/api/pdf/catalog', {
        method: 'POST',
        body: JSON.stringify({ locale: 'fr' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_LOCALE');
      expect(data.error.message).toBe('Locale must be either "ar" or "en"');
    });

    it('should return 404 when no products found', async () => {
      (productService.getAll as jest.Mock).mockResolvedValueOnce([]);

      const request = new NextRequest('http://localhost:3000/api/pdf/catalog', {
        method: 'POST',
        body: JSON.stringify({ locale: 'en' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NO_PRODUCTS');
      expect(data.error.message).toBe('No products found to generate PDF');
    });

    it('should return 404 when filtered productIds result in no products', async () => {
      const request = new NextRequest('http://localhost:3000/api/pdf/catalog', {
        method: 'POST',
        body: JSON.stringify({
          productIds: ['non-existent-id'],
          locale: 'en',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NO_PRODUCTS');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty productIds array', async () => {
      const request = new NextRequest('http://localhost:3000/api/pdf/catalog', {
        method: 'POST',
        body: JSON.stringify({
          productIds: [],
          locale: 'en',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(pdfService.generateCatalog).toHaveBeenCalledWith(mockProducts, 'en');
    });

    it('should handle null productIds', async () => {
      const request = new NextRequest('http://localhost:3000/api/pdf/catalog', {
        method: 'POST',
        body: JSON.stringify({
          productIds: null,
          locale: 'en',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(pdfService.generateCatalog).toHaveBeenCalledWith(mockProducts, 'en');
    });

    it('should handle products without prices', async () => {
      const productsWithoutPrice = [
        {
          ...mockProducts[0],
          price: null,
        },
      ];

      (productService.getAll as jest.Mock).mockResolvedValueOnce(productsWithoutPrice);

      const request = new NextRequest('http://localhost:3000/api/pdf/catalog', {
        method: 'POST',
        body: JSON.stringify({ locale: 'en' }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(pdfService.generateCatalog).toHaveBeenCalledWith(productsWithoutPrice, 'en');
    });

    it('should handle products without images', async () => {
      const productsWithoutImages = [
        {
          ...mockProducts[0],
          images: [],
        },
      ];

      (productService.getAll as jest.Mock).mockResolvedValueOnce(productsWithoutImages);

      const request = new NextRequest('http://localhost:3000/api/pdf/catalog', {
        method: 'POST',
        body: JSON.stringify({ locale: 'en' }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(pdfService.generateCatalog).toHaveBeenCalledWith(productsWithoutImages, 'en');
    });

    it('should handle products without colors', async () => {
      const productsWithoutColors = [
        {
          ...mockProducts[0],
          colors: [],
        },
      ];

      (productService.getAll as jest.Mock).mockResolvedValueOnce(productsWithoutColors);

      const request = new NextRequest('http://localhost:3000/api/pdf/catalog', {
        method: 'POST',
        body: JSON.stringify({ locale: 'en' }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(pdfService.generateCatalog).toHaveBeenCalledWith(productsWithoutColors, 'en');
    });
  });

  describe('Error Handling', () => {
    it('should return 500 when ProductService.getAll throws error', async () => {
      (productService.getAll as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/pdf/catalog', {
        method: 'POST',
        body: JSON.stringify({ locale: 'en' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_ERROR');
      expect(data.error.message).toBe('Failed to generate PDF catalog');
    });

    it('should return 500 when pdfService.generateCatalog throws error', async () => {
      (pdfService.generateCatalog as jest.Mock) = jest.fn().mockRejectedValue(
        new Error('PDF generation failed')
      );

      const request = new NextRequest('http://localhost:3000/api/pdf/catalog', {
        method: 'POST',
        body: JSON.stringify({ locale: 'en' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_ERROR');
    });

    it('should return 500 when request body is invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/pdf/catalog', {
        method: 'POST',
        body: 'invalid-json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('ProductIds Filtering', () => {
    it('should filter out non-matching product IDs', async () => {
      const request = new NextRequest('http://localhost:3000/api/pdf/catalog', {
        method: 'POST',
        body: JSON.stringify({
          productIds: ['prod-1', 'non-existent'],
          locale: 'en',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(pdfService.generateCatalog).toHaveBeenCalledWith(
        [mockProducts[0]],
        'en'
      );
    });

    it('should handle productIds with duplicates', async () => {
      const request = new NextRequest('http://localhost:3000/api/pdf/catalog', {
        method: 'POST',
        body: JSON.stringify({
          productIds: ['prod-1', 'prod-1', 'prod-2'],
          locale: 'en',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      // Should still include each product only once
      expect(pdfService.generateCatalog).toHaveBeenCalledWith(mockProducts, 'en');
    });

    it('should ignore non-array productIds', async () => {
      const request = new NextRequest('http://localhost:3000/api/pdf/catalog', {
        method: 'POST',
        body: JSON.stringify({
          productIds: 'prod-1',
          locale: 'en',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      // Should use all products when productIds is not an array
      expect(pdfService.generateCatalog).toHaveBeenCalledWith(mockProducts, 'en');
    });
  });
});
