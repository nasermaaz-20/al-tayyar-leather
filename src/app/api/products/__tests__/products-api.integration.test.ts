/**
 * Integration tests for Product API routes
 * These tests verify the API routes work correctly with the actual ProductService
 */

import { prisma } from '@/src/server/db/prisma';
import { ProductService } from '@/src/server/services/product.service';
import { CategoryService } from '@/src/server/services/category.service';
import { ColorService } from '@/src/server/services/color.service';

describe('Product API Integration Tests', () => {
  const productService = new ProductService();
  const categoryService = new CategoryService();
  const colorService = new ColorService();

  let testCategoryId: string;
  let testColorId: string;
  let testProductId: string;
  let testProductSlug: string;

  beforeAll(async () => {
    // Create test category
    const category = await categoryService.create({
      nameAr: 'فئة اختبار',
      nameEn: 'Test Category',
    });
    testCategoryId = category.id;

    // Create test color
    const color = await colorService.create({
      nameAr: 'بني',
      nameEn: 'Brown',
      hexCode: '#8B4513',
    });
    testColorId = color.id;

    // Create test product
    const product = await productService.create({
      nameAr: 'حقيبة جلدية اختبار',
      nameEn: 'Test Leather Bag',
      descAr: 'حقيبة جلدية فاخرة للاختبار',
      descEn: 'Premium leather bag for testing',
      price: 150,
      categoryIds: [testCategoryId],
      colorIds: [testColorId],
      images: [
        {
          url: '/uploads/test-bag.jpg',
          alt: 'Test bag',
          order: 0,
        },
      ],
    });
    testProductId = product.id;
    testProductSlug = product.slug;
  });

  afterAll(async () => {
    // Clean up test data
    if (testProductId) {
      await productService.delete(testProductId);
    }
    if (testCategoryId) {
      await prisma.category.delete({ where: { id: testCategoryId } });
    }
    if (testColorId) {
      await prisma.color.delete({ where: { id: testColorId } });
    }
  });

  describe('ProductService.getAll', () => {
    it('should return all products without filters', async () => {
      const products = await productService.getAll();
      
      expect(products).toBeDefined();
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);
      
      const testProduct = products.find(p => p.id === testProductId);
      expect(testProduct).toBeDefined();
      expect(testProduct?.nameEn).toBe('Test Leather Bag');
      expect(testProduct?.nameAr).toBe('حقيبة جلدية اختبار');
    });

    it('should filter products by category', async () => {
      const products = await productService.getAll({
        categoryIds: [testCategoryId],
      });
      
      expect(products).toBeDefined();
      expect(Array.isArray(products)).toBe(true);
      
      const testProduct = products.find(p => p.id === testProductId);
      expect(testProduct).toBeDefined();
      expect(testProduct?.categories.some(c => c.id === testCategoryId)).toBe(true);
    });

    it('should filter products by color', async () => {
      const products = await productService.getAll({
        colorIds: [testColorId],
      });
      
      expect(products).toBeDefined();
      expect(Array.isArray(products)).toBe(true);
      
      const testProduct = products.find(p => p.id === testProductId);
      expect(testProduct).toBeDefined();
      expect(testProduct?.colors.some(c => c.id === testColorId)).toBe(true);
    });

    it('should filter products by search query', async () => {
      const products = await productService.getAll({
        searchQuery: 'Test Leather',
      });
      
      expect(products).toBeDefined();
      expect(Array.isArray(products)).toBe(true);
      
      const testProduct = products.find(p => p.id === testProductId);
      expect(testProduct).toBeDefined();
    });

    it('should apply multiple filters (category and color)', async () => {
      const products = await productService.getAll({
        categoryIds: [testCategoryId],
        colorIds: [testColorId],
      });
      
      expect(products).toBeDefined();
      expect(Array.isArray(products)).toBe(true);
      
      const testProduct = products.find(p => p.id === testProductId);
      expect(testProduct).toBeDefined();
      expect(testProduct?.categories.some(c => c.id === testCategoryId)).toBe(true);
      expect(testProduct?.colors.some(c => c.id === testColorId)).toBe(true);
    });
  });

  describe('ProductService.getBySlug', () => {
    it('should return a product by slug', async () => {
      const product = await productService.getBySlug(testProductSlug);
      
      expect(product).toBeDefined();
      expect(product?.id).toBe(testProductId);
      expect(product?.nameEn).toBe('Test Leather Bag');
      expect(product?.nameAr).toBe('حقيبة جلدية اختبار');
      expect(product?.slug).toBe(testProductSlug);
    });

    it('should return product with all relations (images, colors, categories)', async () => {
      const product = await productService.getBySlug(testProductSlug);
      
      expect(product).toBeDefined();
      expect(product?.images).toBeDefined();
      expect(product?.images.length).toBeGreaterThan(0);
      expect(product?.colors).toBeDefined();
      expect(product?.colors.length).toBeGreaterThan(0);
      expect(product?.categories).toBeDefined();
      expect(product?.categories.length).toBeGreaterThan(0);
    });

    it('should return null for non-existent slug', async () => {
      const product = await productService.getBySlug('non-existent-slug-12345');
      
      expect(product).toBeNull();
    });

    it('should handle optional price correctly', async () => {
      const product = await productService.getBySlug(testProductSlug);
      
      expect(product).toBeDefined();
      expect(product?.price).toBeDefined();
      expect(Number(product?.price)).toBe(150);
    });
  });

  describe('Localization behavior', () => {
    it('should return bilingual data for products', async () => {
      const products = await productService.getAll();
      const testProduct = products.find(p => p.id === testProductId);
      
      expect(testProduct).toBeDefined();
      expect(testProduct?.nameAr).toBe('حقيبة جلدية اختبار');
      expect(testProduct?.nameEn).toBe('Test Leather Bag');
      expect(testProduct?.descAr).toBe('حقيبة جلدية فاخرة للاختبار');
      expect(testProduct?.descEn).toBe('Premium leather bag for testing');
    });

    it('should return bilingual data for colors', async () => {
      const product = await productService.getBySlug(testProductSlug);
      
      expect(product).toBeDefined();
      expect(product?.colors.length).toBeGreaterThan(0);
      
      const color = product?.colors[0];
      expect(color?.nameAr).toBeDefined();
      expect(color?.nameEn).toBeDefined();
      expect(color?.hexCode).toBeDefined();
    });

    it('should return bilingual data for categories', async () => {
      const product = await productService.getBySlug(testProductSlug);
      
      expect(product).toBeDefined();
      expect(product?.categories.length).toBeGreaterThan(0);
      
      const category = product?.categories[0];
      expect(category?.nameAr).toBeDefined();
      expect(category?.nameEn).toBeDefined();
    });
  });
});
