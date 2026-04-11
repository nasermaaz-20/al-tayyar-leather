import { POST } from '../route';
import { PUT, DELETE } from '../[id]/route';
import { productService } from '@/src/server/services/product.service';
import { withAuth } from '@/src/server/middleware/auth.middleware';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/src/server/services/product.service');
jest.mock('@/src/server/middleware/auth.middleware');

describe('Admin Product API Routes', () => {
  const mockWithAuth = withAuth as jest.MockedFunction<typeof withAuth>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock withAuth to execute the handler directly (simulating authenticated request)
    mockWithAuth.mockImplementation(async (req, handler) => {
      return handler(req);
    });
  });

  describe('POST /api/admin/products', () => {
    it('should create a product with valid data', async () => {
      const mockProduct = {
        id: 'prod_1',
        nameAr: 'حقيبة جلدية',
        nameEn: 'Leather Bag',
        descAr: 'حقيبة جلدية فاخرة',
        descEn: 'Premium leather bag',
        price: 299.99,
        slug: 'leather-bag',
        images: [{ id: 'img_1', url: '/test.jpg', alt: 'Test', order: 0 }],
        colors: [{ id: 'color_1', nameAr: 'بني', nameEn: 'Brown', hexCode: '#8B4513' }],
        categories: [{ id: 'cat_1', nameAr: 'حقائب', nameEn: 'Bags', slug: 'bags' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (productService.create as jest.Mock).mockResolvedValue(mockProduct);

      const request = new NextRequest('http://localhost:3000/api/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          nameAr: 'حقيبة جلدية',
          nameEn: 'Leather Bag',
          descAr: 'حقيبة جلدية فاخرة',
          descEn: 'Premium leather bag',
          price: 299.99,
          categoryIds: ['cat_1'],
          colorIds: ['color_1'],
          images: [{ url: '/test.jpg', alt: 'Test', order: 0 }],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toMatchObject({
        id: mockProduct.id,
        nameAr: mockProduct.nameAr,
        nameEn: mockProduct.nameEn,
        descAr: mockProduct.descAr,
        descEn: mockProduct.descEn,
        price: mockProduct.price,
        slug: mockProduct.slug,
      });
      expect(productService.create).toHaveBeenCalledWith({
        nameAr: 'حقيبة جلدية',
        nameEn: 'Leather Bag',
        descAr: 'حقيبة جلدية فاخرة',
        descEn: 'Premium leather bag',
        price: 299.99,
        categoryIds: ['cat_1'],
        colorIds: ['color_1'],
        images: [{ url: '/test.jpg', alt: 'Test', order: 0 }],
      });
    });

    it('should create a product without optional price', async () => {
      const mockProduct = {
        id: 'prod_1',
        nameAr: 'حقيبة جلدية',
        nameEn: 'Leather Bag',
        descAr: 'حقيبة جلدية فاخرة',
        descEn: 'Premium leather bag',
        price: null,
        slug: 'leather-bag',
        images: [],
        colors: [],
        categories: [{ id: 'cat_1', nameAr: 'حقائب', nameEn: 'Bags', slug: 'bags' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (productService.create as jest.Mock).mockResolvedValue(mockProduct);

      const request = new NextRequest('http://localhost:3000/api/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          nameAr: 'حقيبة جلدية',
          nameEn: 'Leather Bag',
          descAr: 'حقيبة جلدية فاخرة',
          descEn: 'Premium leather bag',
          categoryIds: ['cat_1'],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(productService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nameAr: 'حقيبة جلدية',
          nameEn: 'Leather Bag',
          price: undefined,
        })
      );
    });

    it('should reject product creation without Arabic name', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          nameEn: 'Leather Bag',
          descAr: 'حقيبة جلدية فاخرة',
          descEn: 'Premium leather bag',
          categoryIds: ['cat_1'],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.nameAr).toBeDefined();
    });

    it('should reject product creation without English name', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          nameAr: 'حقيبة جلدية',
          descAr: 'حقيبة جلدية فاخرة',
          descEn: 'Premium leather bag',
          categoryIds: ['cat_1'],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.details.nameEn).toBeDefined();
    });

    it('should reject product creation without Arabic description', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          nameAr: 'حقيبة جلدية',
          nameEn: 'Leather Bag',
          descEn: 'Premium leather bag',
          categoryIds: ['cat_1'],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.details.descAr).toBeDefined();
    });

    it('should reject product creation without English description', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          nameAr: 'حقيبة جلدية',
          nameEn: 'Leather Bag',
          descAr: 'حقيبة جلدية فاخرة',
          categoryIds: ['cat_1'],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.details.descEn).toBeDefined();
    });

    it('should reject product creation without categories', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          nameAr: 'حقيبة جلدية',
          nameEn: 'Leather Bag',
          descAr: 'حقيبة جلدية فاخرة',
          descEn: 'Premium leather bag',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.details.categoryIds).toBeDefined();
    });

    it('should reject product creation with empty category array', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          nameAr: 'حقيبة جلدية',
          nameEn: 'Leather Bag',
          descAr: 'حقيبة جلدية فاخرة',
          descEn: 'Premium leather bag',
          categoryIds: [],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.details.categoryIds).toBeDefined();
    });

    it('should reject product creation with negative price', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          nameAr: 'حقيبة جلدية',
          nameEn: 'Leather Bag',
          descAr: 'حقيبة جلدية فاخرة',
          descEn: 'Premium leather bag',
          price: -100,
          categoryIds: ['cat_1'],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.details.price).toBeDefined();
    });

    it('should reject product creation with invalid image data', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          nameAr: 'حقيبة جلدية',
          nameEn: 'Leather Bag',
          descAr: 'حقيبة جلدية فاخرة',
          descEn: 'Premium leather bag',
          categoryIds: ['cat_1'],
          images: [{ url: '/test.jpg' }], // Missing alt and order
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/admin/products/[id]', () => {
    it('should update a product with valid data', async () => {
      const mockProduct = {
        id: 'prod_1',
        nameAr: 'حقيبة جلدية محدثة',
        nameEn: 'Updated Leather Bag',
        descAr: 'حقيبة جلدية فاخرة',
        descEn: 'Premium leather bag',
        price: 349.99,
        slug: 'updated-leather-bag',
        images: [],
        colors: [],
        categories: [{ id: 'cat_1', nameAr: 'حقائب', nameEn: 'Bags', slug: 'bags' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (productService.update as jest.Mock).mockResolvedValue(mockProduct);

      const request = new NextRequest('http://localhost:3000/api/admin/products/prod_1', {
        method: 'PUT',
        body: JSON.stringify({
          nameAr: 'حقيبة جلدية محدثة',
          nameEn: 'Updated Leather Bag',
          price: 349.99,
        }),
      });

      const response = await PUT(request, { params: { id: 'prod_1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toMatchObject({
        id: mockProduct.id,
        nameAr: mockProduct.nameAr,
        nameEn: mockProduct.nameEn,
        price: mockProduct.price,
        slug: mockProduct.slug,
      });
      expect(productService.update).toHaveBeenCalledWith('prod_1', {
        nameAr: 'حقيبة جلدية محدثة',
        nameEn: 'Updated Leather Bag',
        price: 349.99,
      });
    });

    it('should update product price to null', async () => {
      const mockProduct = {
        id: 'prod_1',
        nameAr: 'حقيبة جلدية',
        nameEn: 'Leather Bag',
        descAr: 'حقيبة جلدية فاخرة',
        descEn: 'Premium leather bag',
        price: null,
        slug: 'leather-bag',
        images: [],
        colors: [],
        categories: [{ id: 'cat_1', nameAr: 'حقائب', nameEn: 'Bags', slug: 'bags' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (productService.update as jest.Mock).mockResolvedValue(mockProduct);

      const request = new NextRequest('http://localhost:3000/api/admin/products/prod_1', {
        method: 'PUT',
        body: JSON.stringify({
          price: null,
        }),
      });

      const response = await PUT(request, { params: { id: 'prod_1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(productService.update).toHaveBeenCalledWith('prod_1', {
        price: null,
      });
    });

    it('should reject update with empty Arabic name', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/products/prod_1', {
        method: 'PUT',
        body: JSON.stringify({
          nameAr: '',
        }),
      });

      const response = await PUT(request, { params: { id: 'prod_1' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.details.nameAr).toBeDefined();
    });

    it('should reject update with empty category array', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/products/prod_1', {
        method: 'PUT',
        body: JSON.stringify({
          categoryIds: [],
        }),
      });

      const response = await PUT(request, { params: { id: 'prod_1' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.details.categoryIds).toBeDefined();
    });

    it('should return 404 for non-existent product', async () => {
      (productService.update as jest.Mock).mockRejectedValue(new Error('Product not found'));

      const request = new NextRequest('http://localhost:3000/api/admin/products/invalid_id', {
        method: 'PUT',
        body: JSON.stringify({
          nameAr: 'حقيبة جلدية',
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
    it('should delete a product successfully', async () => {
      (productService.delete as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/admin/products/prod_1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'prod_1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toBe('Product deleted successfully');
      expect(productService.delete).toHaveBeenCalledWith('prod_1');
    });

    it('should return 404 for non-existent product', async () => {
      (productService.delete as jest.Mock).mockRejectedValue(new Error('Product not found'));

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

  describe('Authentication', () => {
    it('should require authentication for POST', async () => {
      // Mock withAuth to return unauthorized
      mockWithAuth.mockImplementationOnce(async () => {
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Authentication required',
            },
          }),
          { status: 401 }
        );
      });

      const request = new NextRequest('http://localhost:3000/api/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          nameAr: 'حقيبة جلدية',
          nameEn: 'Leather Bag',
          descAr: 'حقيبة جلدية فاخرة',
          descEn: 'Premium leather bag',
          categoryIds: ['cat_1'],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should require authentication for PUT', async () => {
      // Mock withAuth to return unauthorized
      mockWithAuth.mockImplementationOnce(async () => {
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Authentication required',
            },
          }),
          { status: 401 }
        );
      });

      const request = new NextRequest('http://localhost:3000/api/admin/products/prod_1', {
        method: 'PUT',
        body: JSON.stringify({
          nameAr: 'حقيبة جلدية',
        }),
      });

      const response = await PUT(request, { params: { id: 'prod_1' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should require authentication for DELETE', async () => {
      // Mock withAuth to return unauthorized
      mockWithAuth.mockImplementationOnce(async () => {
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Authentication required',
            },
          }),
          { status: 401 }
        );
      });

      const request = new NextRequest('http://localhost:3000/api/admin/products/prod_1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'prod_1' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });
});
