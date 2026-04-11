import { NextRequest } from 'next/server';
import { withAuth } from '@/src/server/middleware/auth.middleware';
import { categoryService } from '@/src/server/services/category.service';
import {
  successResponse,
  errorResponse,
  validationError,
  serverError,
} from '@/src/shared/utils/api-response';

/**
 * POST /api/admin/categories
 * Create a new category
 * Protected route - requires authentication
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const body = await req.json();

      // Validate required fields
      const errors: Record<string, string> = {};

      if (!body.nameAr || typeof body.nameAr !== 'string' || !body.nameAr.trim()) {
        errors.nameAr = 'Arabic name is required';
      }

      if (!body.nameEn || typeof body.nameEn !== 'string' || !body.nameEn.trim()) {
        errors.nameEn = 'English name is required';
      }

      // Return validation errors if any
      if (Object.keys(errors).length > 0) {
        return validationError(errors);
      }

      // Create category
      const category = await categoryService.create({
        nameAr: body.nameAr,
        nameEn: body.nameEn,
      });

      return successResponse(category, 201);
    } catch (error) {
      console.error('Error creating category:', error);

      if (error instanceof Error) {
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

      return serverError('Failed to create category');
    }
  });
}
