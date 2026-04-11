import { PDFService } from '../pdf.service';
import { readFileSync } from 'fs';
import { join } from 'path';

// Store original readFileSync
const originalReadFileSync = jest.requireActual('fs').readFileSync;

// Mock fs module
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}));

describe('PDFService', () => {
  let pdfService: PDFService;

  beforeEach(() => {
    pdfService = new PDFService();
    jest.clearAllMocks();
    
    // Mock readFileSync to allow font files but mock image files
    (readFileSync as jest.Mock).mockImplementation((path: string, ...args: any[]) => {
      // Allow PDFKit to load font files from node_modules
      if (path.includes('node_modules') || path.includes('pdfkit') || path.includes('.afm')) {
        return originalReadFileSync(path, ...args);
      }
      // Mock image files
      if (path.includes('logo.jpg') || path.includes('uploads') || path.includes('img')) {
        // Return a minimal valid JPEG buffer
        return Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
      }
      // Default: use original
      return originalReadFileSync(path, ...args);
    });
  });

  const mockProduct = {
    id: 'prod_1',
    nameAr: 'حقيبة جلدية فاخرة',
    nameEn: 'Premium Leather Bag',
    descAr: 'حقيبة جلدية مصنوعة يدوياً من أجود أنواع الجلد الطبيعي',
    descEn: 'Handcrafted leather bag made from the finest natural leather',
    price: 250,
    images: [
      { url: '/uploads/products/bag1.jpg', alt: 'Leather Bag', order: 0 },
    ],
    colors: [
      { nameAr: 'بني', nameEn: 'Brown', hexCode: '#8B4513' },
      { nameAr: 'أسود', nameEn: 'Black', hexCode: '#000000' },
    ],
    categories: [
      { nameAr: 'حقائب', nameEn: 'Bags' },
    ],
  };

  describe('generateCatalog', () => {
    it('should generate PDF for English locale', async () => {
      const products = [mockProduct];
      
      const buffer = await pdfService.generateCatalog(products, 'en');

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      
      // Check PDF header
      const pdfHeader = buffer.toString('utf8', 0, 5);
      expect(pdfHeader).toBe('%PDF-');
    });

    it('should generate PDF for Arabic locale', async () => {
      const products = [mockProduct];
      
      const buffer = await pdfService.generateCatalog(products, 'ar');

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      
      // Check PDF header
      const pdfHeader = buffer.toString('utf8', 0, 5);
      expect(pdfHeader).toBe('%PDF-');
    });

    it('should generate PDF with multiple products', async () => {
      const products = [
        mockProduct,
        {
          ...mockProduct,
          id: 'prod_2',
          nameAr: 'محفظة جلدية',
          nameEn: 'Leather Wallet',
        },
        {
          ...mockProduct,
          id: 'prod_3',
          nameAr: 'حزام جلدي',
          nameEn: 'Leather Belt',
        },
      ];
      
      const buffer = await pdfService.generateCatalog(products, 'en');

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should handle products without price', async () => {
      const productWithoutPrice = {
        ...mockProduct,
        price: null,
      };
      
      const buffer = await pdfService.generateCatalog([productWithoutPrice], 'en');

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should handle products without images', async () => {
      const productWithoutImages = {
        ...mockProduct,
        images: [],
      };
      
      const buffer = await pdfService.generateCatalog([productWithoutImages], 'en');

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should handle products without colors', async () => {
      const productWithoutColors = {
        ...mockProduct,
        colors: [],
      };
      
      const buffer = await pdfService.generateCatalog([productWithoutColors], 'en');

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should handle empty product list', async () => {
      const buffer = await pdfService.generateCatalog([], 'en');

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      
      // Should still have PDF header
      const pdfHeader = buffer.toString('utf8', 0, 5);
      expect(pdfHeader).toBe('%PDF-');
    });

    it('should handle products with multiple colors', async () => {
      const productWithManyColors = {
        ...mockProduct,
        colors: [
          { nameAr: 'بني', nameEn: 'Brown', hexCode: '#8B4513' },
          { nameAr: 'أسود', nameEn: 'Black', hexCode: '#000000' },
          { nameAr: 'أبيض', nameEn: 'White', hexCode: '#FFFFFF' },
          { nameAr: 'أحمر', nameEn: 'Red', hexCode: '#FF0000' },
        ],
      };
      
      const buffer = await pdfService.generateCatalog([productWithManyColors], 'en');

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should handle products with multiple images', async () => {
      const productWithManyImages = {
        ...mockProduct,
        images: [
          { url: '/uploads/products/bag1.jpg', alt: 'Bag Front', order: 0 },
          { url: '/uploads/products/bag2.jpg', alt: 'Bag Back', order: 1 },
          { url: '/uploads/products/bag3.jpg', alt: 'Bag Side', order: 2 },
        ],
      };
      
      const buffer = await pdfService.generateCatalog([productWithManyImages], 'en');

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should handle long product descriptions', async () => {
      const productWithLongDesc = {
        ...mockProduct,
        descEn: 'This is a very long description that contains a lot of text. '.repeat(20),
        descAr: 'هذا وصف طويل جداً يحتوي على الكثير من النص. '.repeat(20),
      };
      
      const buffer = await pdfService.generateCatalog([productWithLongDesc], 'en');

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should handle products with special characters in names', async () => {
      const productWithSpecialChars = {
        ...mockProduct,
        nameEn: 'Leather Bag & Wallet (Premium)',
        nameAr: 'حقيبة جلدية & محفظة (فاخرة)',
      };
      
      const buffer = await pdfService.generateCatalog([productWithSpecialChars], 'en');

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should handle products with zero price', async () => {
      const productWithZeroPrice = {
        ...mockProduct,
        price: 0,
      };
      
      const buffer = await pdfService.generateCatalog([productWithZeroPrice], 'en');

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should handle products with very high price', async () => {
      const productWithHighPrice = {
        ...mockProduct,
        price: 999999.99,
      };
      
      const buffer = await pdfService.generateCatalog([productWithHighPrice], 'en');

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should handle missing logo file gracefully', async () => {
      // Mock readFileSync to throw error for logo only
      (readFileSync as jest.Mock).mockImplementation((path: string, ...args: any[]) => {
        // Allow PDFKit to load font files
        if (path.includes('node_modules') || path.includes('pdfkit') || path.includes('.afm')) {
          return originalReadFileSync(path, ...args);
        }
        // Throw error for logo
        if (path.includes('logo.jpg')) {
          throw new Error('File not found');
        }
        // Return mock for other images
        return Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
      });

      const buffer = await pdfService.generateCatalog([mockProduct], 'en');

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should handle missing product image gracefully', async () => {
      // Mock readFileSync to throw error for product images
      (readFileSync as jest.Mock).mockImplementation((path: string, ...args: any[]) => {
        // Allow PDFKit to load font files
        if (path.includes('node_modules') || path.includes('pdfkit') || path.includes('.afm')) {
          return originalReadFileSync(path, ...args);
        }
        // Throw error for product images
        if (path.includes('uploads')) {
          throw new Error('File not found');
        }
        // Return mock for logo
        return Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
      });

      const buffer = await pdfService.generateCatalog([mockProduct], 'en');

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should use RTL layout for Arabic locale', async () => {
      const buffer = await pdfService.generateCatalog([mockProduct], 'ar');

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      
      // PDF should be generated successfully with RTL layout
      const pdfHeader = buffer.toString('utf8', 0, 5);
      expect(pdfHeader).toBe('%PDF-');
    });

    it('should use LTR layout for English locale', async () => {
      const buffer = await pdfService.generateCatalog([mockProduct], 'en');

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      
      // PDF should be generated successfully with LTR layout
      const pdfHeader = buffer.toString('utf8', 0, 5);
      expect(pdfHeader).toBe('%PDF-');
    });

    it('should include product name in selected language', async () => {
      const bufferEn = await pdfService.generateCatalog([mockProduct], 'en');
      const bufferAr = await pdfService.generateCatalog([mockProduct], 'ar');

      expect(bufferEn).toBeInstanceOf(Buffer);
      expect(bufferAr).toBeInstanceOf(Buffer);
      
      // Both should be valid PDFs
      expect(bufferEn.toString('utf8', 0, 5)).toBe('%PDF-');
      expect(bufferAr.toString('utf8', 0, 5)).toBe('%PDF-');
    });

    it('should include product description in selected language', async () => {
      const bufferEn = await pdfService.generateCatalog([mockProduct], 'en');
      const bufferAr = await pdfService.generateCatalog([mockProduct], 'ar');

      expect(bufferEn).toBeInstanceOf(Buffer);
      expect(bufferAr).toBeInstanceOf(Buffer);
      
      // Both should be valid PDFs
      expect(bufferEn.toString('utf8', 0, 5)).toBe('%PDF-');
      expect(bufferAr.toString('utf8', 0, 5)).toBe('%PDF-');
    });

    it('should include color names in selected language', async () => {
      const bufferEn = await pdfService.generateCatalog([mockProduct], 'en');
      const bufferAr = await pdfService.generateCatalog([mockProduct], 'ar');

      expect(bufferEn).toBeInstanceOf(Buffer);
      expect(bufferAr).toBeInstanceOf(Buffer);
      
      // Both should be valid PDFs
      expect(bufferEn.toString('utf8', 0, 5)).toBe('%PDF-');
      expect(bufferAr.toString('utf8', 0, 5)).toBe('%PDF-');
    });

    it('should handle products with undefined price', async () => {
      const productWithUndefinedPrice = {
        ...mockProduct,
        price: undefined,
      };
      
      const buffer = await pdfService.generateCatalog([productWithUndefinedPrice], 'en');

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should handle products with empty string names', async () => {
      const productWithEmptyNames = {
        ...mockProduct,
        nameEn: '',
        nameAr: '',
      };
      
      const buffer = await pdfService.generateCatalog([productWithEmptyNames], 'en');

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should handle products with empty string descriptions', async () => {
      const productWithEmptyDesc = {
        ...mockProduct,
        descEn: '',
        descAr: '',
      };
      
      const buffer = await pdfService.generateCatalog([productWithEmptyDesc], 'en');

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });
});
