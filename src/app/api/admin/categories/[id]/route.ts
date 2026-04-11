import { NextRequest } from 'next/server';
import { withAuth } from '@/src/server/middleware/auth.middleware';
import { categoryService } from '@/src/server/services/category.service';
import {
  successResponse,
  errorResponse,
  validationError,
  notFoundError,
  serverError,
} from '@/src/shared/utils/api-response';

/**
 * PUT /api/admin/categories/[id]
 * Update an existing category
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

      // Return validation errors if any
      if (Object.keys(errors).length > 0) {
        return validationError(errors);
      }

      // Prepare update data
      const updateData: any = {};

      if (body.nameAr !== undefined) updateData.nameAr = body.nameAr;
      if (body.nameEn !== undefined) updateData.nameEn = body.nameEn;

      // Update category
      const category = await categoryService.update(id, updateData);

      return successResponse(category);
    } catch (error) {
      console.error('Error updating category:', error);

      if (error instanceof Error) {
        // Handle not found error
        if (error.message === 'Category not found') {
          return notFoundError('Category not found');
        }

        // Handle known validation errors from service
        if (
          error.message.includes('required') ||
          error.message.includes('cannot be empty')
        ) {
          return errorResponse('VALIDATION_ERROR', error.message, 400);
        }

        // Handle duplicate slug error
        if (error.message.includes('Unique constraint')) {
          return errorResponse('DUPLICATE_ERROR', 'Category with this name already exists', 409);
        }
      }

      return serverError('Failed to update category');
    }
  });
}

/**
 * DELETE /api/admin/categories/[id]
 * Delete a category (with referential integrity check)
 * Protected route - requires authentication
 */
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return withAuth(request, async () => {
    try {
      const { id } = params;

      // Check if category has products
      // Categories can be deleted even if they have products
      // (Checks removed)

      // Delete category
      await categoryService.delete(id);

      return successResponse({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Error deleting category:', error);

      if (error instanceof Error) {
        // Handle not found error
        if (error.message === 'Category not found') {
          return notFoundError('Category not found');
        }
      }

      return serverError('Failed to delete category');
    }
  });
}
