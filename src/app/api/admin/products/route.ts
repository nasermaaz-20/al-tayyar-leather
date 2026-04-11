import { NextRequest } from 'next/server';
import { withAuth } from '@/src/server/middleware/auth.middleware';
import { productService } from '@/src/server/services/product.service';
import {
  successResponse,
  errorResponse,
  validationError,
  serverError,
} from '@/src/shared/utils/api-response';

/**
 * POST /api/admin/products
 * Create a new product
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

      if (!body.descAr || typeof body.descAr !== 'string' || !body.descAr.trim()) {
        errors.descAr = 'Arabic description is required';
      }

      if (!body.descEn || typeof body.descEn !== 'string' || !body.descEn.trim()) {
        errors.descEn = 'English description is required';
      }

      if (!body.categoryIds || !Array.isArray(body.categoryIds) || body.categoryIds.length === 0) {
        errors.categoryIds = 'At least one category must be selected';
      }

      // Validate price if provided
      if (body.price !== undefined && body.price !== null) {
        const price = Number(body.price);
        if (isNaN(price) || price < 0) {
          errors.price = 'Price must be a positive number';
        }
      }

      // Validate images if provided
      if (body.images !== undefined) {
        if (!Array.isArray(body.images)) {
          errors.images = 'Images must be an array';
        } else {
          body.images.forEach((img: any, index: number) => {
            if (!img.url || typeof img.url !== 'string') {
              errors[`images[${index}].url`] = 'Image URL is required';
            }
            if (!img.alt || typeof img.alt !== 'string') {
              errors[`images[${index}].alt`] = 'Image alt text is required';
            }
            if (typeof img.order !== 'number') {
              errors[`images[${index}].order`] = 'Image order must be a number';
            }
          });
        }
      }

      // Validate colorIds if provided
      if (body.colorIds !== undefined && !Array.isArray(body.colorIds)) {
        errors.colorIds = 'Color IDs must be an array';
      }

      // Return validation errors if any
      if (Object.keys(errors).length > 0) {
        console.error('Validation errors payload:', errors);
        return validationError(errors);
      }

      // Create product
      const product = await productService.create({
        nameAr: body.nameAr,
        nameEn: body.nameEn,
        descAr: body.descAr,
        descEn: body.descEn,
        price: body.price !== undefined && body.price !== null ? Number(body.price) : undefined,
        images: body.images,
        categoryIds: body.categoryIds,
        colorIds: body.colorIds,
      });

      return successResponse(product, 201);
    } catch (error) {
      console.error('Error creating product:', error);

      if (error instanceof Error) {
        // Handle known validation errors from service
        if (
          error.message.includes('required') ||
          error.message.includes('must be selected') ||
          error.message.includes('cannot be empty')
        ) {
          return errorResponse('VALIDATION_ERROR', error.message, 400);
        }
      }

      return serverError('Failed to create product');
    }
  });
}
