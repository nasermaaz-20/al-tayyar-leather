import { NextRequest } from 'next/server';
import { withAuth } from '@/src/server/middleware/auth.middleware';
import { imageService } from '@/src/server/services/image.service';
import {
  successResponse,
  errorResponse,
  validationError,
  serverError,
} from '@/src/shared/utils/api-response';

/**
 * DELETE /api/admin/images
 * Delete image from storage
 * Protected route - requires authentication
 */
export async function DELETE(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const url = searchParams.get('url');

      // Validate required fields
      if (!url || typeof url !== 'string' || !url.trim()) {
        return validationError({ url: 'Image URL is required' });
      }

      // Validate URL format (should start with /uploads/)
      if (!url.startsWith('/uploads/')) {
        return errorResponse(
          'VALIDATION_ERROR',
          'Invalid image URL format. URL must start with /uploads/',
          400
        );
      }

      // Delete image
      await imageService.delete(url);

      return successResponse({ message: 'Image deleted successfully' }, 200);
    } catch (error) {
      console.error('Error deleting image:', error);

      if (error instanceof Error) {
        // Handle specific errors
        if (error.message.includes('not found') || error.message.includes('ENOENT')) {
          return errorResponse('NOT_FOUND', 'Image not found', 404);
        }
      }

      return serverError('Failed to delete image');
    }
  });
}
