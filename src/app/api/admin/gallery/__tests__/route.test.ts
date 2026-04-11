import { POST, PUT } from '../route';
import { DELETE } from '../[id]/route';
import { galleryService } from '@/src/server/services/gallery.service';
import { withAuth } from '@/src/server/middleware/auth.middleware';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/src/server/services/gallery.service');
jest.mock('@/src/server/middleware/auth.middleware');

describe('Admin Gallery API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock withAuth to execute handler directly
    (withAuth as jest.Mock).mockImplementation(
      async (req: NextRequest, handler: Function) => {
        return handler(req);
      }
    );
  });

  describe('POST /api/admin/gallery', () => {
    it('should upload a gallery image with valid data', async () => {
      const mockImage = {
        id: 'img_1',
        url: '/uploads/gallery/image1.jpg',
        alt: 'Leather product showcase',
        order: 0,
        createdAt: new Date(),
      };

      (galleryService.upload as jest.Mock).mockResolvedValue(mockImage);

      const request = new NextRequest('http://localhost:3000/api/admin/gallery', {
        method: 'POST',
        body: JSON.stringify({
          url: '/uploads/gallery/image1.jpg',
          alt: 'Leather product showcase',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(mockImage.id);
      expect(data.data.url).toBe(mockImage.url);
      expect(data.data.alt).toBe(mockImage.alt);
      expect(data.data.order).toBe(mockImage.order);
      expect(galleryService.upload).toHaveBeenCalledWith({
        url: '/uploads/gallery/image1.jpg',
        alt: 'Leather product showcase',
      });
    });

    it('should return validation error when URL is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/gallery', {
        method: 'POST',
        body: JSON.stringify({
          alt: 'Leather product showcase',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.url).toBeDefined();
    });

    it('should return validation error when alt text is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/gallery', {
        method: 'POST',
        body: JSON.stringify({
          url: '/uploads/gallery/image1.jpg',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.alt).toBeDefined();
    });

    it('should return validation error when fields are empty strings', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/gallery', {
        method: 'POST',
        body: JSON.stringify({
          url: '   ',
          alt: '   ',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.url).toBeDefined();
      expect(data.error.details.alt).toBeDefined();
    });
  });

  describe('PUT /api/admin/gallery/reorder', () => {
    it('should reorder gallery images with valid image IDs', async () => {
      (galleryService.reorder as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/admin/gallery/reorder', {
        method: 'PUT',
        body: JSON.stringify({
          imageIds: ['img_3', 'img_1', 'img_2'],
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toBe('Gallery images reordered successfully');
      expect(galleryService.reorder).toHaveBeenCalledWith(['img_3', 'img_1', 'img_2']);
    });

    it('should return validation error when imageIds is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/gallery/reorder', {
        method: 'PUT',
        body: JSON.stringify({}),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.imageIds).toBeDefined();
    });

    it('should return validation error when imageIds is not an array', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/gallery/reorder', {
        method: 'PUT',
        body: JSON.stringify({
          imageIds: 'not-an-array',
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.imageIds).toBeDefined();
    });

    it('should return validation error when imageIds is empty', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/gallery/reorder', {
        method: 'PUT',
        body: JSON.stringify({
          imageIds: [],
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.imageIds).toContain('cannot be empty');
    });

    it('should return validation error when imageIds contains non-strings', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/gallery/reorder', {
        method: 'PUT',
        body: JSON.stringify({
          imageIds: ['img_1', 123, 'img_2'],
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.imageIds).toContain('must be strings');
    });
  });

  describe('DELETE /api/admin/gallery/[id]', () => {
    it('should delete a gallery image', async () => {
      (galleryService.delete as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/admin/gallery/img_1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'img_1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toBe('Gallery image deleted successfully');
      expect(galleryService.delete).toHaveBeenCalledWith('img_1');
    });

    it('should return not found error when image does not exist', async () => {
      (galleryService.delete as jest.Mock).mockRejectedValue(
        new Error('Record to delete does not exist')
      );

      const request = new NextRequest('http://localhost:3000/api/admin/gallery/img_999', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'img_999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });
});
