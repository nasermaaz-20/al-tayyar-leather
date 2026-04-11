import fc from 'fast-check';
import { POST, PUT } from '../route';
import { DELETE } from '../[id]/route';
import { galleryService } from '@/src/server/services/gallery.service';
import { withAuth } from '@/src/server/middleware/auth.middleware';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/src/server/services/gallery.service');
jest.mock('@/src/server/middleware/auth.middleware');

/**
 * Property-Based Tests for Admin Gallery API Routes
 * Feature: leather-ecommerce-platform
 * 
 * These tests verify universal properties that should hold across all inputs
 * using randomized test data generation with fast-check.
 */
describe('Admin Gallery API Routes - Property-Based Tests', () => {
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
   * Property: Valid gallery image upload data should always succeed
   * Validates: Requirements 7.1
   */
  describe('POST /api/admin/gallery - Upload Property', () => {
    it('should successfully upload any valid gallery image data', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            url: fc.webUrl(),
            alt: fc.string({ minLength: 1, maxLength: 200 }),
          }),
          async (imageData) => {
            const mockImage = {
              id: fc.sample(fc.uuid(), 1)[0],
              url: imageData.url,
              alt: imageData.alt,
              order: fc.sample(fc.integer({ min: 0, max: 1000 }), 1)[0],
              createdAt: new Date(),
            };

            (galleryService.upload as jest.Mock).mockResolvedValue(mockImage);

            const request = new NextRequest('http://localhost:3000/api/admin/gallery', {
              method: 'POST',
              body: JSON.stringify(imageData),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(data.data.url).toBe(imageData.url);
            expect(data.data.alt).toBe(imageData.alt);
            expect(galleryService.upload).toHaveBeenCalledWith(imageData);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Missing required fields should always fail validation
     * Validates: Requirements 7.1
     */
    it('should reject upload when required fields are missing', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.record({ alt: fc.string({ minLength: 1 }) }), // Missing url
            fc.record({ url: fc.webUrl() }), // Missing alt
            fc.record({}) // Missing both
          ),
          async (invalidData) => {
            const request = new NextRequest('http://localhost:3000/api/admin/gallery', {
              method: 'POST',
              body: JSON.stringify(invalidData),
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
  });

  /**
   * Property: Reordering with valid image IDs should always succeed
   * Validates: Requirements 7.1
   */
  describe('PUT /api/admin/gallery/reorder - Reorder Property', () => {
    it('should successfully reorder any valid array of image IDs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.uuid(), { minLength: 1, maxLength: 20 }),
          async (imageIds) => {
            (galleryService.reorder as jest.Mock).mockResolvedValue(undefined);

            const request = new NextRequest('http://localhost:3000/api/admin/gallery/reorder', {
              method: 'PUT',
              body: JSON.stringify({ imageIds }),
            });

            const response = await PUT(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(galleryService.reorder).toHaveBeenCalledWith(imageIds);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Invalid imageIds input should always fail validation
     * Validates: Requirements 7.1
     */
    it('should reject reorder when imageIds is invalid', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.constant({}), // Missing imageIds
            fc.record({ imageIds: fc.string() }), // Not an array
            fc.record({ imageIds: fc.constant([]) }), // Empty array
            fc.record({ imageIds: fc.array(fc.integer(), { minLength: 1 }) }) // Non-string IDs
          ),
          async (invalidData) => {
            const request = new NextRequest('http://localhost:3000/api/admin/gallery/reorder', {
              method: 'PUT',
              body: JSON.stringify(invalidData),
            });

            const response = await PUT(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error.code).toBe('VALIDATION_ERROR');
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property: Deleting any valid image ID should succeed
   * Validates: Requirements 7.2
   */
  describe('DELETE /api/admin/gallery/[id] - Delete Property', () => {
    it('should successfully delete any valid gallery image ID', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          async (imageId) => {
            (galleryService.delete as jest.Mock).mockResolvedValue(undefined);

            const request = new NextRequest(`http://localhost:3000/api/admin/gallery/${imageId}`, {
              method: 'DELETE',
            });

            const response = await DELETE(request, { params: { id: imageId } });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(galleryService.delete).toHaveBeenCalledWith(imageId);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Deleting non-existent image should always return 404
     * Validates: Requirements 7.2
     */
    it('should return 404 for any non-existent image ID', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          async (imageId) => {
            (galleryService.delete as jest.Mock).mockRejectedValue(
              new Error('Record to delete does not exist')
            );

            const request = new NextRequest(`http://localhost:3000/api/admin/gallery/${imageId}`, {
              method: 'DELETE',
            });

            const response = await DELETE(request, { params: { id: imageId } });
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
   * Validates: API consistency across all gallery operations
   */
  describe('Response Structure Consistency', () => {
    it('should return consistent success response structure for all operations', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            url: fc.webUrl(),
            alt: fc.string({ minLength: 1, maxLength: 200 }),
          }),
          async (imageData) => {
            const mockImage = {
              id: fc.sample(fc.uuid(), 1)[0],
              url: imageData.url,
              alt: imageData.alt,
              order: 0,
              createdAt: new Date(),
            };

            (galleryService.upload as jest.Mock).mockResolvedValue(mockImage);

            const request = new NextRequest('http://localhost:3000/api/admin/gallery', {
              method: 'POST',
              body: JSON.stringify(imageData),
            });

            const response = await POST(request);
            const data = await response.json();

            // Verify consistent response structure
            expect(data).toHaveProperty('success');
            expect(data).toHaveProperty('data');
            expect(data.success).toBe(true);
            expect(typeof data.data).toBe('object');
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should return consistent error response structure for all validation failures', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.record({ alt: fc.string({ minLength: 1 }) }), // Missing url
            fc.record({ url: fc.webUrl() }) // Missing alt
          ),
          async (invalidData) => {
            const request = new NextRequest('http://localhost:3000/api/admin/gallery', {
              method: 'POST',
              body: JSON.stringify(invalidData),
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
