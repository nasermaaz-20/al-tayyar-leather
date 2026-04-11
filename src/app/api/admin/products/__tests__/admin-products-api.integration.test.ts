import { POST } from '../route';
import { PUT, DELETE } from '../[id]/route';
import { prisma } from '@/src/server/db/prisma';
import { NextRequest } from 'next/server';
import { withAuth } from '@/src/server/middleware/auth.middleware';

// Mock authentication middleware
jest.mock('@/src/server/middleware/auth.middleware');

describe('Admin Product API Integration Tests', () => {
  const mockWithAuth = withAuth as jest.MockedFunction<typeof withAuth>;

  let testCategoryId: string;
  let testColorId: string;
  let testProductId: string;

  beforeAll(async () => {
    // Mock withAuth to execute the handler directly
    mockWithAuth.mockImplementation(async (req, handler) => {
      return handler(req);
    });

    // Create test category
    const category = await prisma.category.create({
      data: {
        nameAr: 'فئة اختبار',
        nameEn: 'Test Category',
        slug: 'test-category-admin-products',
      },
    });
    testCategoryId = category.id;

    // Create test color
    const color = await prisma.color.create({
      data: {
        nameAr: 'لون اختبار',
        nameEn: 'Test Color',
        hexCode: '#FF0000',
      },
    });
    testColorId = color.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (testProductId) {
      await prisma.product.deleteMany({
        where: { id: testProductId },
      });
    }

    await prisma.category.deleteMany({
      where: { id: testCategoryId },
    });

    await prisma.color.deleteMany({
      where: { id: testColorId },
    });

    await prisma.$disconnect();
  });

  describe('POST /api/admin/products', () => {
    it('should create a product with all fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          nameAr: 'منتج اختبار كامل',
          nameEn: 'Full Test Product',
          descAr: 'وصف منتج اختبار كامل',
          descEn: 'Full test product description',
          price: 199.99,
          categoryIds: [testCategoryId],
          colorIds: [testColorId],
          images: [
            { url: '/test-image-1.jpg', alt: 'Test Image 1', order: 0 },
            { url: '/test-image-2.jpg', alt: 'Test Image 2', order: 1 },
          ],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toMatchObject({
        nameAr: 'منتج اختبار كامل',
        nameEn: 'Full Test Product',
        descAr: 'وصف منتج اختبار كامل',
        descEn: 'Full test product description',
      });
      expect(Number(data.data.price)).toBe(199.99);
      expect(data.data.images).toHaveLength(2);
      expect(data.data.colors).toHaveLength(1);
      expect(data.data.categories).toHaveLength(1);
      expect(data.data.slug).toMatch(/^full-test-product(-\d+)?$/);

      // Store for later tests
      testProductId = data.data.id;

      // Verify in database
      const dbProduct = await prisma.product.findUnique({
        where: { id: testProductId },
        include: {
          images: true,
          colors: true,
          categories: true,
        },
      });

      expect(dbProduct).not.toBeNull();
      expect(dbProduct?.nameAr).toBe('منتج اختبار كامل');
      expect(dbProduct?.images).toHaveLength(2);
    });

    it('should create a product without optional fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          nameAr: 'منتج اختبار بسيط',
          nameEn: 'Simple Test Product',
          descAr: 'وصف منتج اختبار بسيط',
          descEn: 'Simple test product description',
          categoryIds: [testCategoryId],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.price).toBeNull();
      expect(data.data.images).toHaveLength(0);
      expect(data.data.colors).toHaveLength(0);

      // Clean up
      await prisma.product.delete({ where: { id: data.data.id } });
    });
  });

  describe('PUT /api/admin/products/[id]', () => {
    it('should update product fields', async () => {
      if (!testProductId) {
        console.warn('Skipping test - testProductId not set');
        return;
      }
      const request = new NextRequest(`http://localhost:3000/api/admin/products/${testProductId}`, {
        method: 'PUT',
        body: JSON.stringify({
          nameAr: 'منتج اختبار محدث',
          nameEn: 'Updated Test Product',
          price: 249.99,
        }),
      });

      const response = await PUT(request, { params: { id: testProductId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toMatchObject({
        nameAr: 'منتج اختبار محدث',
        nameEn: 'Updated Test Product',
      });
      expect(Number(data.data.price)).toBe(249.99);
      expect(data.data.slug).toBe('updated-test-product');

      // Verify in database
      const dbProduct = await prisma.product.findUnique({
        where: { id: testProductId },
      });

      expect(dbProduct?.nameAr).toBe('منتج اختبار محدث');
      expect(dbProduct?.price?.toString()).toBe('249.99');
    });

    it('should update product images', async () => {
      if (!testProductId) {
        console.warn('Skipping test - testProductId not set');
        return;
      }
      const request = new NextRequest(`http://localhost:3000/api/admin/products/${testProductId}`, {
        method: 'PUT',
        body: JSON.stringify({
          images: [
            { url: '/new-image-1.jpg', alt: 'New Image 1', order: 0 },
            { url: '/new-image-2.jpg', alt: 'New Image 2', order: 1 },
            { url: '/new-image-3.jpg', alt: 'New Image 3', order: 2 },
          ],
        }),
      });

      const response = await PUT(request, { params: { id: testProductId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.images).toHaveLength(3);

      // Verify in database
      const dbProduct = await prisma.product.findUnique({
        where: { id: testProductId },
        include: { images: true },
      });

      expect(dbProduct?.images).toHaveLength(3);
    });

    it('should return 404 for non-existent product', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/products/invalid_id', {
        method: 'PUT',
        body: JSON.stringify({
          nameAr: 'منتج اختبار',
        }),
      });

      const response = await PUT(request, { params: { id: 'invalid_id' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('DELETE /api/admin/products/[id]', () => {
    it('should delete a product', async () => {
      // Create a product to delete
      const product = await prisma.product.create({
        data: {
          nameAr: 'منتج للحذف',
          nameEn: 'Product to Delete',
          descAr: 'وصف منتج للحذف',
          descEn: 'Product to delete description',
          slug: 'product-to-delete-admin',
          categories: {
            create: [{ categoryId: testCategoryId }],
          },
        },
      });

      const request = new NextRequest(`http://localhost:3000/api/admin/products/${product.id}`, {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: product.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toBe('Product deleted successfully');

      // Verify deletion in database
      const dbProduct = await prisma.product.findUnique({
        where: { id: product.id },
      });

      expect(dbProduct).toBeNull();
    });

    it('should return 404 for non-existent product', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/products/invalid_id', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'invalid_id' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('Cascade deletion', () => {
    it('should delete product images when product is deleted', async () => {
      // Create a product with images
      const product = await prisma.product.create({
        data: {
          nameAr: 'منتج مع صور',
          nameEn: 'Product with Images',
          descAr: 'وصف منتج مع صور',
          descEn: 'Product with images description',
          slug: 'product-with-images-admin',
          categories: {
            create: [{ categoryId: testCategoryId }],
          },
          images: {
            create: [
              { url: '/image-1.jpg', alt: 'Image 1', order: 0 },
              { url: '/image-2.jpg', alt: 'Image 2', order: 1 },
            ],
          },
        },
        include: { images: true },
      });

      const imageIds = product.images.map((img) => img.id);

      // Delete the product
      const request = new NextRequest(`http://localhost:3000/api/admin/products/${product.id}`, {
        method: 'DELETE',
      });

      await DELETE(request, { params: { id: product.id } });

      // Verify images are deleted
      const remainingImages = await prisma.productImage.findMany({
        where: { id: { in: imageIds } },
      });

      expect(remainingImages).toHaveLength(0);
    });

    it('should delete product-category associations when product is deleted', async () => {
      // Create a product with category
      const product = await prisma.product.create({
        data: {
          nameAr: 'منتج مع فئة',
          nameEn: 'Product with Category',
          descAr: 'وصف منتج مع فئة',
          descEn: 'Product with category description',
          slug: 'product-with-category-admin',
          categories: {
            create: [{ categoryId: testCategoryId }],
          },
        },
      });

      // Delete the product
      const request = new NextRequest(`http://localhost:3000/api/admin/products/${product.id}`, {
        method: 'DELETE',
      });

      await DELETE(request, { params: { id: product.id } });

      // Verify associations are deleted
      const remainingAssociations = await prisma.productCategory.findMany({
        where: { productId: product.id },
      });

      expect(remainingAssociations).toHaveLength(0);
    });
  });
});
