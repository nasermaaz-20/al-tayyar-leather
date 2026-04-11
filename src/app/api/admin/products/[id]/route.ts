import { NextRequest } from 'next/server';
import { withAuth } from '@/src/server/middleware/auth.middleware';
import { productService } from '@/src/server/services/product.service';
import {
  successResponse,
  errorResponse,
  validationError,
  notFoundError,
  serverError,
} from '@/src/shared/utils/api-response';

/**
 * PUT /api/admin/products/[id]
 * Update an existing product
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

      if (body.descAr !== undefined) {
        if (typeof body.descAr !== 'string' || !body.descAr.trim()) {
          errors.descAr = 'Arabic description cannot be empty';
        }
      }

      if (body.descEn !== undefined) {
        if (typeof body.descEn !== 'string' || !body.descEn.trim()) {
          errors.descEn = 'English description cannot be empty';
        }
      }

      if (body.categoryIds !== undefined) {
        if (!Array.isArray(body.categoryIds) || body.categoryIds.length === 0) {
          errors.categoryIds = 'At least one category must be selected';
        }
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
        return validationError(errors);
      }

      // Prepare update data
      const updateData: any = {};

      if (body.nameAr !== undefined) updateData.nameAr = body.nameAr;
      if (body.nameEn !== undefined) updateData.nameEn = body.nameEn;
      if (body.descAr !== undefined) updateData.descAr = body.descAr;
      if (body.descEn !== undefined) updateData.descEn = body.descEn;
      if (body.price !== undefined) {
        updateData.price = body.price !== null ? Number(body.price) : null;
      }
      if (body.images !== undefined) updateData.images = body.images;
      if (body.categoryIds !== undefined) updateData.categoryIds = body.categoryIds;
      if (body.colorIds !== undefined) updateData.colorIds = body.colorIds;

      // Update product
      const product = await productService.update(id, updateData);

      return successResponse(product);
    } catch (error) {
      console.error('Error updating product:', error);

      if (error instanceof Error) {
        // Handle not found error
        if (error.message === 'Product not found') {
          return notFoundError('Product not found');
        }

        // Handle known validation errors from service
        if (
          error.message.includes('required') ||
          error.message.includes('must be selected') ||
          error.message.includes('cannot be empty')
        ) {
          return errorResponse('VALIDATION_ERROR', error.message, 400);
        }
      }

      return serverError('Failed to update product');
    }
  });
}

/**
 * DELETE /api/admin/products/[id]
 * Delete a product
 * Protected route - requires authentication
 */
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return withAuth(request, async () => {
    try {
      const { id } = params;

      // Delete product
      await productService.delete(id);

      return successResponse({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);

      if (error instanceof Error) {
        // Handle not found error
        if (error.message === 'Product not found') {
          return notFoundError('Product not found');
        }
      }

      return serverError('Failed to delete product');
    }
  });
}
