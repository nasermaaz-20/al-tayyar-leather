import { POST } from '../route';
import { PUT, DELETE } from '../[id]/route';
import { categoryService } from '@/src/server/services/category.service';
import { withAuth } from '@/src/server/middleware/auth.middleware';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/src/server/services/category.service');
jest.mock('@/src/server/middleware/auth.middleware');

describe('Admin Category API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock withAuth to execute handler directly
    (withAuth as jest.Mock).mockImplementation(
      async (req: NextRequest, handler: Function) => {
        return handler(req);
      }
    );
  });

  describe('POST /api/admin/categories', () => {
    it('should create a category with valid data', async () => {
      const mockCategory = {
        id: 'cat_1',
        nameAr: 'حقائب',
        nameEn: 'Bags',
        slug: 'bags',
      };

      (categoryService.create as jest.Mock).mockResolvedValue(mockCategory);

      const request = new NextRequest('http://localhost:3000/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify({
          nameAr: 'حقائب',
          nameEn: 'Bags',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockCategory);
      expect(categoryService.create).toHaveBeenCalledWith({
        nameAr: 'حقائب',
        nameEn: 'Bags',
      });
    });

    it('should return validation error when Arabic name is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify({
          nameEn: 'Bags',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.nameAr).toBeDefined();
    });

    it('should return validation error when English name is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify({
          nameAr: 'حقائب',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.nameEn).toBeDefined();
    });

    it('should return validation error when names are empty strings', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify({
          nameAr: '   ',
          nameEn: '   ',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.nameAr).toBeDefined();
      expect(data.error.details.nameEn).toBeDefined();
    });

    it('should handle duplicate category error', async () => {
      (categoryService.create as jest.Mock).mockRejectedValue(
        new Error('Unique constraint failed')
      );

      const request = new NextRequest('http://localhost:3000/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify({
          nameAr: 'حقائب',
          nameEn: 'Bags',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('DUPLICATE_ERROR');
    });
  });

  describe('PUT /api/admin/categories/[id]', () => {
    it('should update a category with valid data', async () => {
      const mockCategory = {
        id: 'cat_1',
        nameAr: 'حقائب محدثة',
        nameEn: 'Updated Bags',
        slug: 'updated-bags',
      };

      (categoryService.update as jest.Mock).mockResolvedValue(mockCategory);

      const request = new NextRequest('http://localhost:3000/api/admin/categories/cat_1', {
        method: 'PUT',
        body: JSON.stringify({
          nameAr: 'حقائب محدثة',
          nameEn: 'Updated Bags',
        }),
      });

      const response = await PUT(request, { params: { id: 'cat_1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockCategory);
      expect(categoryService.update).toHaveBeenCalledWith('cat_1', {
        nameAr: 'حقائب محدثة',
        nameEn: 'Updated Bags',
      });
    });

    it('should update only provided fields', async () => {
      const mockCategory = {
        id: 'cat_1',
        nameAr: 'حقائب محدثة',
        nameEn: 'Bags',
        slug: 'bags',
      };

      (categoryService.update as jest.Mock).mockResolvedValue(mockCategory);

      const request = new NextRequest('http://localhost:3000/api/admin/categories/cat_1', {
        method: 'PUT',
        body: JSON.stringify({
          nameAr: 'حقائب محدثة',
        }),
      });

      const response = await PUT(request, { params: { id: 'cat_1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(categoryService.update).toHaveBeenCalledWith('cat_1', {
        nameAr: 'حقائب محدثة',
      });
    });

    it('should return validation error when names are empty strings', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/categories/cat_1', {
        method: 'PUT',
        body: JSON.stringify({
          nameAr: '   ',
        }),
      });

      const response = await PUT(request, { params: { id: 'cat_1' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.nameAr).toBeDefined();
    });

    it('should return not found error when category does not exist', async () => {
      (categoryService.update as jest.Mock).mockRejectedValue(
        new Error('Category not found')
      );

      const request = new NextRequest('http://localhost:3000/api/admin/categories/cat_999', {
        method: 'PUT',
        body: JSON.stringify({
          nameAr: 'حقائب',
        }),
      });

      const response = await PUT(request, { params: { id: 'cat_999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('DELETE /api/admin/categories/[id]', () => {
    it('should delete a category when it has no products', async () => {
      (categoryService.hasProducts as jest.Mock).mockResolvedValue(false);
      (categoryService.delete as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/admin/categories/cat_1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'cat_1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toBe('Category deleted successfully');
      expect(categoryService.hasProducts).toHaveBeenCalledWith('cat_1');
      expect(categoryService.delete).toHaveBeenCalledWith('cat_1');
    });

    it('should return referential integrity error when category has products', async () => {
      (categoryService.hasProducts as jest.Mock).mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/admin/categories/cat_1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'cat_1' } });
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('REFERENTIAL_INTEGRITY_ERROR');
      expect(data.error.message).toContain('associated products');
      expect(categoryService.hasProducts).toHaveBeenCalledWith('cat_1');
      expect(categoryService.delete).not.toHaveBeenCalled();
    });

    it('should return not found error when category does not exist', async () => {
      (categoryService.hasProducts as jest.Mock).mockResolvedValue(false);
      (categoryService.delete as jest.Mock).mockRejectedValue(
        new Error('Category not found')
      );

      const request = new NextRequest('http://localhost:3000/api/admin/categories/cat_999', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'cat_999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });
});
