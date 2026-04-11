import { POST } from '../route';
import { PUT, DELETE } from '../[id]/route';
import { colorService } from '@/src/server/services/color.service';
import { withAuth } from '@/src/server/middleware/auth.middleware';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/src/server/services/color.service');
jest.mock('@/src/server/middleware/auth.middleware');

describe('Admin Color API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock withAuth to execute handler directly
    (withAuth as jest.Mock).mockImplementation(
      async (req: NextRequest, handler: Function) => {
        return handler(req);
      }
    );
  });

  describe('POST /api/admin/colors', () => {
    it('should create a color with valid data', async () => {
      const mockColor = {
        id: 'color_1',
        nameAr: 'بني',
        nameEn: 'Brown',
        hexCode: '#8B4513',
      };

      (colorService.create as jest.Mock).mockResolvedValue(mockColor);

      const request = new NextRequest('http://localhost:3000/api/admin/colors', {
        method: 'POST',
        body: JSON.stringify({
          nameAr: 'بني',
          nameEn: 'Brown',
          hexCode: '#8B4513',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockColor);
      expect(colorService.create).toHaveBeenCalledWith({
        nameAr: 'بني',
        nameEn: 'Brown',
        hexCode: '#8B4513',
      });
    });

    it('should accept short hex code format', async () => {
      const mockColor = {
        id: 'color_1',
        nameAr: 'أحمر',
        nameEn: 'Red',
        hexCode: '#F00',
      };

      (colorService.create as jest.Mock).mockResolvedValue(mockColor);

      const request = new NextRequest('http://localhost:3000/api/admin/colors', {
        method: 'POST',
        body: JSON.stringify({
          nameAr: 'أحمر',
          nameEn: 'Red',
          hexCode: '#F00',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });

    it('should return validation error when Arabic name is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/colors', {
        method: 'POST',
        body: JSON.stringify({
          nameEn: 'Brown',
          hexCode: '#8B4513',
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
      const request = new NextRequest('http://localhost:3000/api/admin/colors', {
        method: 'POST',
        body: JSON.stringify({
          nameAr: 'بني',
          hexCode: '#8B4513',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.nameEn).toBeDefined();
    });

    it('should return validation error when hex code is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/colors', {
        method: 'POST',
        body: JSON.stringify({
          nameAr: 'بني',
          nameEn: 'Brown',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.hexCode).toBeDefined();
    });

    it('should return validation error when hex code format is invalid', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/colors', {
        method: 'POST',
        body: JSON.stringify({
          nameAr: 'بني',
          nameEn: 'Brown',
          hexCode: 'invalid',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.hexCode).toContain('Invalid hex code format');
    });

    it('should return validation error when names are empty strings', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/colors', {
        method: 'POST',
        body: JSON.stringify({
          nameAr: '   ',
          nameEn: '   ',
          hexCode: '#8B4513',
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

    it('should handle duplicate color error', async () => {
      (colorService.create as jest.Mock).mockRejectedValue(
        new Error('Unique constraint failed')
      );

      const request = new NextRequest('http://localhost:3000/api/admin/colors', {
        method: 'POST',
        body: JSON.stringify({
          nameAr: 'بني',
          nameEn: 'Brown',
          hexCode: '#8B4513',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('DUPLICATE_ERROR');
    });
  });

  describe('PUT /api/admin/colors/[id]', () => {
    it('should update a color with valid data', async () => {
      const mockColor = {
        id: 'color_1',
        nameAr: 'بني غامق',
        nameEn: 'Dark Brown',
        hexCode: '#654321',
      };

      (colorService.update as jest.Mock).mockResolvedValue(mockColor);

      const request = new NextRequest('http://localhost:3000/api/admin/colors/color_1', {
        method: 'PUT',
        body: JSON.stringify({
          nameAr: 'بني غامق',
          nameEn: 'Dark Brown',
          hexCode: '#654321',
        }),
      });

      const response = await PUT(request, { params: { id: 'color_1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockColor);
      expect(colorService.update).toHaveBeenCalledWith('color_1', {
        nameAr: 'بني غامق',
        nameEn: 'Dark Brown',
        hexCode: '#654321',
      });
    });

    it('should update only provided fields', async () => {
      const mockColor = {
        id: 'color_1',
        nameAr: 'بني غامق',
        nameEn: 'Brown',
        hexCode: '#8B4513',
      };

      (colorService.update as jest.Mock).mockResolvedValue(mockColor);

      const request = new NextRequest('http://localhost:3000/api/admin/colors/color_1', {
        method: 'PUT',
        body: JSON.stringify({
          nameAr: 'بني غامق',
        }),
      });

      const response = await PUT(request, { params: { id: 'color_1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(colorService.update).toHaveBeenCalledWith('color_1', {
        nameAr: 'بني غامق',
      });
    });

    it('should return validation error when names are empty strings', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/colors/color_1', {
        method: 'PUT',
        body: JSON.stringify({
          nameAr: '   ',
        }),
      });

      const response = await PUT(request, { params: { id: 'color_1' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.nameAr).toBeDefined();
    });

    it('should return validation error when hex code format is invalid', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/colors/color_1', {
        method: 'PUT',
        body: JSON.stringify({
          hexCode: 'not-a-hex',
        }),
      });

      const response = await PUT(request, { params: { id: 'color_1' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.hexCode).toContain('Invalid hex code format');
    });

    it('should return not found error when color does not exist', async () => {
      (colorService.update as jest.Mock).mockRejectedValue(
        new Error('Color not found')
      );

      const request = new NextRequest('http://localhost:3000/api/admin/colors/color_999', {
        method: 'PUT',
        body: JSON.stringify({
          nameAr: 'بني',
        }),
      });

      const response = await PUT(request, { params: { id: 'color_999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('DELETE /api/admin/colors/[id]', () => {
    it('should delete a color when it is not used by products', async () => {
      (colorService.isUsedByProducts as jest.Mock).mockResolvedValue(false);
      (colorService.delete as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/admin/colors/color_1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'color_1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toBe('Color deleted successfully');
      expect(colorService.isUsedByProducts).toHaveBeenCalledWith('color_1');
      expect(colorService.delete).toHaveBeenCalledWith('color_1');
    });

    it('should return referential integrity error when color is used by products', async () => {
      (colorService.isUsedByProducts as jest.Mock).mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/admin/colors/color_1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'color_1' } });
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('REFERENTIAL_INTEGRITY_ERROR');
      expect(data.error.message).toContain('used by products');
      expect(colorService.isUsedByProducts).toHaveBeenCalledWith('color_1');
      expect(colorService.delete).not.toHaveBeenCalled();
    });

    it('should return not found error when color does not exist', async () => {
      (colorService.isUsedByProducts as jest.Mock).mockResolvedValue(false);
      (colorService.delete as jest.Mock).mockRejectedValue(
        new Error('Color not found')
      );

      const request = new NextRequest('http://localhost:3000/api/admin/colors/color_999', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'color_999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });
});
