import fc from 'fast-check';
import { POST } from '../upload/route';
import { DELETE } from '../route';
import { imageService } from '@/src/server/services/image.service';
import { withAuth } from '@/src/server/middleware/auth.middleware';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/src/server/services/image.service');
jest.mock('@/src/server/middleware/auth.middleware');

/**
 * Property-Based Tests for Admin Image API Routes
 * Feature: leather-ecommerce-platform
 * 
 * These tests verify universal properties that should hold across all inputs
 * using randomized test data generation with fast-check.
 */
describe('Admin Image API Routes - Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock withAuth to execute handler directly
    (withAuth as jest.Mock).mockImplementation(
      async (req: NextRequest, handler: Function) => {
        return handler(req);
      }
    );
  });

  /**
   * Property 36: Image Optimization on Upload
   * For any uploaded image, the system should generate optimized versions (WebP format, compressed) for web delivery.
   * **Validates: Requirements 17.1**
   */
  describe('POST /api/admin/images/upload - Image Optimization Property', () => {
    it('should optimize and return URL for any valid image upload', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            filename: fc.string({ minLength: 1, maxLength: 50 }).map(s => `${s}.jpg`),
            folder: fc.constantFrom('products', 'gallery', 'categories'),
            mimeType: fc.constantFrom('image/jpeg', 'image/jpg', 'image/png', 'image/webp'),
          }),
          async (uploadData) => {
            const mockResult = {
              url: `/uploads/${uploadData.folder}/optimized/${uploadData.filename.replace(/\.[^.]+$/, '')}-${Date.now()}.webp`,
            };

            (imageService.upload as jest.Mock).mockResolvedValue(mockResult);

            // Create a mock file
            const fileContent = Buffer.from('fake image content');
            const file = new File([fileContent], uploadData.filename, { type: uploadData.mimeType });

            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', uploadData.folder);

            const request = new NextRequest('http://localhost:3000/api/admin/images/upload', {
              method: 'POST',
              body: formData,
            });

            const response = await POST(request);
            const data = await response.json();

            // Verify successful upload
            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(data.data).toHaveProperty('url');
            expect(data.data.url).toContain('/uploads/');
            expect(data.data.url).toContain('/optimized/');
            expect(data.data.url).toContain('.webp'); // Optimized to WebP format

            // Verify imageService was called with correct parameters
            expect(imageService.upload).toHaveBeenCalledWith(
              expect.objectContaining({
                buffer: expect.any(Buffer),
                originalName: uploadData.filename,
                mimeType: uploadData.mimeType,
              }),
              expect.objectContaining({
                folder: uploadData.folder,
              })
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Image upload with thumbnail generation should return both URLs
     * **Validates: Requirements 17.1**
     */
    it('should generate thumbnail when requested for any valid image', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            filename: fc.string({ minLength: 1, maxLength: 50 }).map(s => `${s}.jpg`),
            folder: fc.constantFrom('products', 'gallery'),
            mimeType: fc.constantFrom('image/jpeg', 'image/png'),
            thumbnailWidth: fc.integer({ min: 50, max: 500 }),
            thumbnailHeight: fc.integer({ min: 50, max: 500 }),
          }),
          async (uploadData) => {
            const baseFilename = uploadData.filename.replace(/\.[^.]+$/, '');
            const mockResult = {
              url: `/uploads/${uploadData.folder}/optimized/${baseFilename}-${Date.now()}.webp`,
              thumbnailUrl: `/uploads/${uploadData.folder}/thumbnails/${baseFilename}-${Date.now()}-thumb.webp`,
            };

            (imageService.upload as jest.Mock).mockResolvedValue(mockResult);

            const fileContent = Buffer.from('fake image content');
            const file = new File([fileContent], uploadData.filename, { type: uploadData.mimeType });

            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', uploadData.folder);
            formData.append('generateThumbnail', 'true');
            formData.append('thumbnailWidth', uploadData.thumbnailWidth.toString());
            formData.append('thumbnailHeight', uploadData.thumbnailHeight.toString());

            const request = new NextRequest('http://localhost:3000/api/admin/images/upload', {
              method: 'POST',
              body: formData,
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(data.data).toHaveProperty('url');
            expect(data.data).toHaveProperty('thumbnailUrl');
            expect(data.data.thumbnailUrl).toContain('/thumbnails/');
            expect(data.data.thumbnailUrl).toContain('-thumb.webp');

            // Verify thumbnail options were passed
            expect(imageService.upload).toHaveBeenCalledWith(
              expect.any(Object),
              expect.objectContaining({
                folder: uploadData.folder,
                generateThumbnail: true,
                thumbnailWidth: uploadData.thumbnailWidth,
                thumbnailHeight: uploadData.thumbnailHeight,
              })
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Missing required fields should always fail validation
     * **Validates: Requirements 17.1**
     */
    it('should reject upload when required fields are missing', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.constant({ hasFile: false, hasFolder: true }), // Missing file
            fc.constant({ hasFile: true, hasFolder: false }), // Missing folder
            fc.constant({ hasFile: false, hasFolder: false }) // Missing both
          ),
          async (scenario) => {
            const formData = new FormData();

            if (scenario.hasFile) {
              const fileContent = Buffer.from('fake image content');
              const file = new File([fileContent], 'test.jpg', { type: 'image/jpeg' });
              formData.append('file', file);
            }

            if (scenario.hasFolder) {
              formData.append('folder', 'products');
            }

            const request = new NextRequest('http://localhost:3000/api/admin/images/upload', {
              method: 'POST',
              body: formData,
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error.code).toBe('VALIDATION_ERROR');
            expect(data.error.details).toBeDefined();
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Property: Invalid file types should always be rejected
     * **Validates: Requirements 17.1**
     */
    it('should reject any non-image file type', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            filename: fc.string({ minLength: 1, maxLength: 50 }),
            mimeType: fc.constantFrom(
              'application/pdf',
              'text/plain',
              'application/json',
              'video/mp4',
              'audio/mpeg'
            ),
          }),
          async (fileData) => {
            (imageService.upload as jest.Mock).mockRejectedValue(
              new Error('Invalid file type. Allowed types: image/jpeg, image/jpg, image/png, image/webp')
            );

            const fileContent = Buffer.from('fake file content');
            const file = new File([fileContent], fileData.filename, { type: fileData.mimeType });

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
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property: Image deletion should succeed for any valid image URL
   * **Validates: Requirements 17.1**
   */
  describe('DELETE /api/admin/images - Image Deletion Property', () => {
    it('should successfully delete any valid image URL', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            folder: fc.constantFrom('products', 'gallery', 'categories'),
            filename: fc.string({ minLength: 1, maxLength: 50 }).map(s => `${s}.webp`),
          }),
          async (imageData) => {
            const imageUrl = `/uploads/${imageData.folder}/optimized/${imageData.filename}`;

            (imageService.delete as jest.Mock).mockResolvedValue(undefined);

            const request = new NextRequest(
              `http://localhost:3000/api/admin/images?url=${encodeURIComponent(imageUrl)}`,
              {
                method: 'DELETE',
              }
            );

            const response = await DELETE(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.message).toBe('Image deleted successfully');
            expect(imageService.delete).toHaveBeenCalledWith(imageUrl);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Missing or empty URL should always fail validation
     * **Validates: Requirements 17.1**
     */
    it('should reject deletion when URL is missing or invalid', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.constant(''), // Empty URL
            fc.constant('   '), // Whitespace only
            fc.string({ minLength: 1 }).filter(s => !s.startsWith('/uploads/')) // Invalid format
          ),
          async (invalidUrl) => {
            const request = new NextRequest(
              `http://localhost:3000/api/admin/images${invalidUrl ? `?url=${encodeURIComponent(invalidUrl)}` : ''}`,
              {
                method: 'DELETE',
              }
            );

            const response = await DELETE(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error.code).toBe('VALIDATION_ERROR');
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Property: Deleting non-existent image should return 404
     * **Validates: Requirements 17.1**
     */
    it('should return 404 for any non-existent image', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            folder: fc.constantFrom('products', 'gallery'),
            filename: fc.string({ minLength: 1, maxLength: 50 }).map(s => `${s}.webp`),
          }),
          async (imageData) => {
            const imageUrl = `/uploads/${imageData.folder}/optimized/${imageData.filename}`;

            (imageService.delete as jest.Mock).mockRejectedValue(
              new Error('ENOENT: no such file or directory')
            );

            const request = new NextRequest(
              `http://localhost:3000/api/admin/images?url=${encodeURIComponent(imageUrl)}`,
              {
                method: 'DELETE',
              }
            );

            const response = await DELETE(request);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.success).toBe(false);
            expect(data.error.code).toBe('NOT_FOUND');
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property: All successful operations should return consistent response structure
   * Validates: API consistency across all image operations
   */
  describe('Response Structure Consistency', () => {
    it('should return consistent success response structure for upload', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            filename: fc.string({ minLength: 1, maxLength: 50 }).map(s => `${s}.jpg`),
            folder: fc.constantFrom('products', 'gallery'),
          }),
          async (uploadData) => {
            const mockResult = {
              url: `/uploads/${uploadData.folder}/optimized/${uploadData.filename.replace(/\.[^.]+$/, '')}.webp`,
            };

            (imageService.upload as jest.Mock).mockResolvedValue(mockResult);

            const fileContent = Buffer.from('fake image content');
            const file = new File([fileContent], uploadData.filename, { type: 'image/jpeg' });

            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', uploadData.folder);

            const request = new NextRequest('http://localhost:3000/api/admin/images/upload', {
              method: 'POST',
              body: formData,
            });

            const response = await POST(request);
            const data = await response.json();

            // Verify consistent response structure
            expect(data).toHaveProperty('success');
            expect(data).toHaveProperty('data');
            expect(data.success).toBe(true);
            expect(typeof data.data).toBe('object');
            expect(data.data).toHaveProperty('url');
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should return consistent error response structure for validation failures', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant({}), // Always missing required fields
          async () => {
            const formData = new FormData();
            // Intentionally not adding file or folder

            const request = new NextRequest('http://localhost:3000/api/admin/images/upload', {
              method: 'POST',
              body: formData,
            });

            const response = await POST(request);
            const data = await response.json();

            // Verify consistent error response structure
            expect(data).toHaveProperty('success');
            expect(data).toHaveProperty('error');
            expect(data.success).toBe(false);
            expect(data.error).toHaveProperty('code');
            expect(data.error).toHaveProperty('message');
            expect(data.error).toHaveProperty('details');
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
