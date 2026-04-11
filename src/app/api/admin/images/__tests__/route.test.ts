import { POST } from '../upload/route';
import { DELETE } from '../route';
import { imageService } from '@/src/server/services/image.service';
import { withAuth } from '@/src/server/middleware/auth.middleware';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/src/server/services/image.service');
jest.mock('@/src/server/middleware/auth.middleware');

describe('Admin Image API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock withAuth to execute handler directly
    (withAuth as jest.Mock).mockImplementation(
      async (req: NextRequest, handler: Function) => {
        return handler(req);
      }
    );
  });

  describe('POST /api/admin/images/upload', () => {
    it('should upload and optimize an image with valid data', async () => {
      const mockResult = {
        url: '/uploads/products/optimized/test-image-123.webp',
      };

      (imageService.upload as jest.Mock).mockResolvedValue(mockResult);

      // Create a mock file
      const fileContent = Buffer.from('fake image content');
      const file = new File([fileContent], 'test-image.jpg', { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'products');

      const request = new NextRequest('http://localhost:3000/api/admin/images/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockResult);
      expect(imageService.upload).toHaveBeenCalledWith(
        expect.objectContaining({
          buffer: expect.any(Buffer),
          originalName: 'test-image.jpg',
          mimeType: 'image/jpeg',
        }),
        expect.objectContaining({
          folder: 'products',
          generateThumbnail: false,
        })
      );
    });

    it('should upload image with thumbnail generation', async () => {
      const mockResult = {
        url: '/uploads/products/optimized/test-image-123.webp',
        thumbnailUrl: '/uploads/products/thumbnails/test-image-123-thumb.webp',
      };

      (imageService.upload as jest.Mock).mockResolvedValue(mockResult);

      const fileContent = Buffer.from('fake image content');
      const file = new File([fileContent], 'test-image.jpg', { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'products');
      formData.append('generateThumbnail', 'true');
      formData.append('thumbnailWidth', '300');
      formData.append('thumbnailHeight', '300');

      const request = new NextRequest('http://localhost:3000/api/admin/images/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockResult);
      expect(imageService.upload).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          folder: 'products',
          generateThumbnail: true,
          thumbnailWidth: 300,
          thumbnailHeight: 300,
        })
      );
    });

    it('should return validation error when file is missing', async () => {
      const formData = new FormData();
      formData.append('folder', 'products');

      const request = new NextRequest('http://localhost:3000/api/admin/images/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.file).toBeDefined();
    });

    it('should return validation error when folder is missing', async () => {
      const fileContent = Buffer.from('fake image content');
      const file = new File([fileContent], 'test-image.jpg', { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('file', file);

      const request = new NextRequest('http://localhost:3000/api/admin/images/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.folder).toBeDefined();
    });

    it('should return validation error when folder is empty string', async () => {
      const fileContent = Buffer.from('fake image content');
      const file = new File([fileContent], 'test-image.jpg', { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', '   ');

      const request = new NextRequest('http://localhost:3000/api/admin/images/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.folder).toBeDefined();
    });

    it('should handle invalid file type error', async () => {
      (imageService.upload as jest.Mock).mockRejectedValue(
        new Error('Invalid file type. Allowed types: image/jpeg, image/jpg, image/png, image/webp')
      );

      const fileContent = Buffer.from('fake pdf content');
      const file = new File([fileContent], 'document.pdf', { type: 'application/pdf' });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'products');

      const request = new NextRequest('http://localhost:3000/api/admin/images/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toContain('Invalid file type');
    });

    it('should handle file size exceeded error', async () => {
      (imageService.upload as jest.Mock).mockRejectedValue(
        new Error('File size exceeds maximum allowed size of 10MB')
      );

      const fileContent = Buffer.from('fake large image content');
      const file = new File([fileContent], 'large-image.jpg', { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'products');

      const request = new NextRequest('http://localhost:3000/api/admin/images/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toContain('File size exceeds');
    });

    it('should handle unexpected errors', async () => {
      (imageService.upload as jest.Mock).mockRejectedValue(
        new Error('Unexpected error')
      );

      const fileContent = Buffer.from('fake image content');
      const file = new File([fileContent], 'test-image.jpg', { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'products');

      const request = new NextRequest('http://localhost:3000/api/admin/images/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('SERVER_ERROR');
      expect(data.error.message).toBe('Failed to upload image');
    });
  });

  describe('DELETE /api/admin/images', () => {
    it('should delete an image with valid URL', async () => {
      (imageService.delete as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest(
        'http://localhost:3000/api/admin/images?url=/uploads/products/optimized/test-image-123.webp',
        {
          method: 'DELETE',
        }
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toBe('Image deleted successfully');
      expect(imageService.delete).toHaveBeenCalledWith('/uploads/products/optimized/test-image-123.webp');
    });

    it('should return validation error when URL is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/images', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.url).toBeDefined();
    });

    it('should return validation error when URL is empty string', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/images?url=   ', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.url).toBeDefined();
    });

    it('should return validation error when URL format is invalid', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/admin/images?url=/invalid/path/image.jpg',
        {
          method: 'DELETE',
        }
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toContain('Invalid image URL format');
    });

    it('should return not found error when image does not exist', async () => {
      (imageService.delete as jest.Mock).mockRejectedValue(
        new Error('ENOENT: no such file or directory')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/admin/images?url=/uploads/products/optimized/nonexistent.webp',
        {
          method: 'DELETE',
        }
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });

    it('should handle unexpected errors', async () => {
      (imageService.delete as jest.Mock).mockRejectedValue(
        new Error('Unexpected error')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/admin/images?url=/uploads/products/optimized/test-image.webp',
        {
          method: 'DELETE',
        }
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('SERVER_ERROR');
      expect(data.error.message).toBe('Failed to delete image');
    });
  });
});
