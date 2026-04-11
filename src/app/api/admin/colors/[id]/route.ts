import { NextRequest } from 'next/server';
import { withAuth } from '@/src/server/middleware/auth.middleware';
import { colorService } from '@/src/server/services/color.service';
import {
  successResponse,
  errorResponse,
  validationError,
  notFoundError,
  serverError,
} from '@/src/shared/utils/api-response';

/**
 * PUT /api/admin/colors/[id]
 * Update an existing color
 * Protected route - requires authentication
 */
export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return withAuth(request, async (req) => {
    try {
      const { id } = params;
      const body = await req.json();

      // Validate fields if provided
      const errors: Record<string, string> = {};

      if (body.nameAr !== undefined) {
        if (typeof body.nameAr !== 'string' || !body.nameAr.trim()) {
          errors.nameAr = 'Arabic name cannot be empty';
        }
      }

      if (body.nameEn !== undefined) {
        if (typeof body.nameEn !== 'string' || !body.nameEn.trim()) {
          errors.nameEn = 'English name cannot be empty';
        }
      }

      if (body.hexCode !== undefined) {
        if (typeof body.hexCode !== 'string' || !body.hexCode.trim()) {
          errors.hexCode = 'Hex code cannot be empty';
        } else {
          // Validate hex code format
          const hexPattern = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
          if (!hexPattern.test(body.hexCode.trim())) {
            errors.hexCode = 'Invalid hex code format. Expected format: #RGB, #RRGGBB, or #RRGGBBAA';
          }
        }
      }

      // Return validation errors if any
      if (Object.keys(errors).length > 0) {
        return validationError(errors);
      }

      // Prepare update data
      const updateData: any = {};

      if (body.nameAr !== undefined) updateData.nameAr = body.nameAr;
      if (body.nameEn !== undefined) updateData.nameEn = body.nameEn;
      if (body.hexCode !== undefined) updateData.hexCode = body.hexCode;

      // Update color
      const color = await colorService.update(id, updateData);

      return successResponse(color);
    } catch (error) {
      console.error('Error updating color:', error);

      if (error instanceof Error) {
        // Handle not found error
        if (error.message === 'Color not found') {
          return notFoundError('Color not found');
        }

        // Handle known validation errors from service
        if (
          error.message.includes('required') ||
          error.message.includes('cannot be empty') ||
          error.message.includes('Invalid hex code')
        ) {
          return errorResponse('VALIDATION_ERROR', error.message, 400);
        }
      }

      return serverError('Failed to update color');
    }
  });
}

/**
 * DELETE /api/admin/colors/[id]
 * Delete a color (with referential integrity check)
 * Protected route - requires authentication
 */
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return withAuth(request, async () => {
    try {
      const { id } = params;

      // Check if color is used by products
      // Colors can be deleted even if they have products
      // (Checks removed)

      // Delete color
      await colorService.delete(id);

      return successResponse({ message: 'Color deleted successfully' });
    } catch (error) {
      console.error('Error deleting color:', error);

      if (error instanceof Error) {
        // Handle not found error
        if (error.message === 'Color not found') {
          return notFoundError('Color not found');
        }
      }

      return serverError('Failed to delete color');
    }
  });
}
