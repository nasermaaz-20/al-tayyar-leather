import { NextRequest } from 'next/server';
import { withAuth } from '@/src/server/middleware/auth.middleware';
import { galleryService } from '@/src/server/services/gallery.service';
import {
  successResponse,
  notFoundError,
  serverError,
} from '@/src/shared/utils/api-response';

/**
 * DELETE /api/admin/gallery/[id]
 * Delete a gallery image
 * Protected route - requires authentication
 */
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return withAuth(request, async () => {
    try {
      const { id } = params;

      // Delete gallery image
      await galleryService.delete(id);

      return successResponse({ message: 'Gallery image deleted successfully' });
    } catch (error) {
      console.error('Error deleting gallery image:', error);

      if (error instanceof Error) {
        // Handle not found error (Prisma throws error when record doesn't exist)
        if (error.message.includes('Record to delete does not exist')) {
          return notFoundError('Gallery image not found');
        }
      }

      return serverError('Failed to delete gallery image');
    }
  });
}
