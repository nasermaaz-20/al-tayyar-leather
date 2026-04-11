import { NextRequest } from 'next/server';
import { withAuth } from '@/src/server/middleware/auth.middleware';
import { galleryService } from '@/src/server/services/gallery.service';
import {
  successResponse,
  validationError,
  serverError,
} from '@/src/shared/utils/api-response';

/**
 * POST /api/admin/gallery
 * Upload a new gallery image
 * Protected route - requires authentication
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const body = await req.json();

      // Validate required fields
      const errors: Record<string, string> = {};

      if (!body.url || typeof body.url !== 'string' || !body.url.trim()) {
        errors.url = 'Image URL is required';
      }

      if (!body.alt || typeof body.alt !== 'string' || !body.alt.trim()) {
        errors.alt = 'Alt text is required';
      }

      // Return validation errors if any
      if (Object.keys(errors).length > 0) {
        return validationError(errors);
      }

      // Upload gallery image
      const image = await galleryService.upload({
        url: body.url,
        alt: body.alt,
      });

      return successResponse(image, 201);
    } catch (error) {
      console.error('Error uploading gallery image:', error);
      return serverError('Failed to upload gallery image');
    }
  });
}

/**
 * PUT /api/admin/gallery/reorder
 * Reorder gallery images
 * Protected route - requires authentication
 */
export async function PUT(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const body = await req.json();

      // Validate imageIds array
      if (!body.imageIds || !Array.isArray(body.imageIds)) {
        return validationError({ imageIds: 'Image IDs array is required' });
      }

      if (body.imageIds.length === 0) {
        return validationError({ imageIds: 'Image IDs array cannot be empty' });
      }

      // Validate that all items are strings
      const invalidIds = body.imageIds.filter((id: any) => typeof id !== 'string');
      if (invalidIds.length > 0) {
        return validationError({ imageIds: 'All image IDs must be strings' });
      }

      // Reorder gallery images
      await galleryService.reorder(body.imageIds);

      return successResponse({ message: 'Gallery images reordered successfully' });
    } catch (error) {
      console.error('Error reordering gallery images:', error);
      return serverError('Failed to reorder gallery images');
    }
  });
}
