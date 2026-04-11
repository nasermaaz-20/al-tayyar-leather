import { NextRequest } from 'next/server';
import { withAuth } from '@/src/server/middleware/auth.middleware';
import { colorService } from '@/src/server/services/color.service';
import {
  successResponse,
  errorResponse,
  validationError,
  serverError,
} from '@/src/shared/utils/api-response';

/**
 * POST /api/admin/colors
 * Create a new color
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

      if (!body.hexCode || typeof body.hexCode !== 'string' || !body.hexCode.trim()) {
        errors.hexCode = 'Hex code is required';
      } else {
        // Validate hex code format
        const hexPattern = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
        if (!hexPattern.test(body.hexCode.trim())) {
          errors.hexCode = 'Invalid hex code format. Expected format: #RGB, #RRGGBB, or #RRGGBBAA';
        }
      }

      // Return validation errors if any
      if (Object.keys(errors).length > 0) {
        return validationError(errors);
      }

      // Create color
      const color = await colorService.create({
        nameAr: body.nameAr,
        nameEn: body.nameEn,
        hexCode: body.hexCode,
      });

      return successResponse(color, 201);
    } catch (error) {
      console.error('Error creating color:', error);

      if (error instanceof Error) {
        // Handle known validation errors from service
        if (
          error.message.includes('required') ||
          error.message.includes('cannot be empty') ||
          error.message.includes('Invalid hex code')
        ) {
          return errorResponse('VALIDATION_ERROR', error.message, 400);
        }

        // Handle duplicate error
        if (error.message.includes('Unique constraint')) {
          return errorResponse('DUPLICATE_ERROR', 'Color with this name already exists', 409);
        }
      }

      return serverError('Failed to create color');
    }
  });
}
