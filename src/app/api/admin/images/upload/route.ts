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
 * POST /api/admin/images/upload
 * Upload and optimize images
 * Protected route - requires authentication
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const folder = formData.get('folder') as string | null;
      const generateThumbnail = formData.get('generateThumbnail') === 'true';
      const thumbnailWidth = formData.get('thumbnailWidth')
        ? parseInt(formData.get('thumbnailWidth') as string, 10)
        : undefined;
      const thumbnailHeight = formData.get('thumbnailHeight')
        ? parseInt(formData.get('thumbnailHeight') as string, 10)
        : undefined;

      // Validate required fields
      const errors: Record<string, string> = {};

      if (!file) {
        errors.file = 'File is required';
      }

      if (!folder || typeof folder !== 'string' || !folder.trim()) {
        errors.folder = 'Folder is required';
      }

      // Return validation errors if any
      if (Object.keys(errors).length > 0) {
        return validationError(errors);
      }

      // Convert File to buffer
      const buffer = Buffer.from(await file!.arrayBuffer());

      // Upload and optimize image
      const result = await imageService.upload(
        {
          buffer,
          originalName: file!.name,
          mimeType: file!.type,
        },
        {
          folder: folder!,
          generateThumbnail,
          thumbnailWidth,
          thumbnailHeight,
        }
      );

      return successResponse(result, 201);
    } catch (error) {
      console.error('Error uploading image:', error);

      if (error instanceof Error) {
        // Handle validation errors from service
        if (
          error.message.includes('Invalid file type') ||
          error.message.includes('File size exceeds')
        ) {
          return errorResponse('VALIDATION_ERROR', error.message, 400);
        }
      }

      return serverError('Failed to upload image');
    }
  });
}
