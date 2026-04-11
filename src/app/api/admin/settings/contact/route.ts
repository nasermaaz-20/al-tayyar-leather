import { NextRequest } from 'next/server';
import { withAuth } from '@/src/server/middleware/auth.middleware';
import { settingsService } from '@/src/server/services/settings.service';
import {
  successResponse,
  errorResponse,
  validationError,
  serverError,
} from '@/src/shared/utils/api-response';

/**
 * PUT /api/admin/settings/contact
 * Update contact settings
 * Protected route - requires authentication
 */
export async function PUT(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const body = await req.json();

      // Validate fields
      const errors: Record<string, string> = {};

      // Validate WhatsApp number if provided
      if (body.whatsappNumber !== undefined && typeof body.whatsappNumber !== 'string') {
        errors.whatsappNumber = 'WhatsApp number must be a string';
      }

      // Validate TikTok URL if provided
      if (body.tiktokUrl !== undefined && typeof body.tiktokUrl !== 'string') {
        errors.tiktokUrl = 'TikTok URL must be a string';
      }

      // Validate Arabic address if provided
      if (body.addressAr !== undefined && typeof body.addressAr !== 'string') {
        errors.addressAr = 'Arabic address must be a string';
      }

      // Validate English address if provided
      if (body.addressEn !== undefined && typeof body.addressEn !== 'string') {
        errors.addressEn = 'English address must be a string';
      }

      // Check for Facebook URL
      if (body.facebookUrl !== undefined && typeof body.facebookUrl !== 'string') {
        errors.facebookUrl = 'Facebook URL must be a string';
      }

      // Check for Instagram URL
      if (body.instagramUrl !== undefined && typeof body.instagramUrl !== 'string') {
        errors.instagramUrl = 'Instagram URL must be a string';
      }

      // Check for Email
      if (body.email !== undefined && typeof body.email !== 'string') {
        errors.email = 'Email must be a string';
      }
      
      // Return validation errors if any
      if (Object.keys(errors).length > 0) {
        return validationError(errors);
      }

      // Update contact settings
      const settings = await settingsService.updateContactSettings({
        whatsappNumber: body.whatsappNumber,
        tiktokUrl: body.tiktokUrl,
        addressAr: body.addressAr,
        addressEn: body.addressEn,
        facebookUrl: body.facebookUrl,
        instagramUrl: body.instagramUrl,
        email: body.email,
      });

      return successResponse(settings, 200);
    } catch (error) {
      console.error('Error updating contact settings:', error);

      if (error instanceof Error) {
        // Handle known validation errors from service
        if (
          error.message.includes('required') ||
          error.message.includes('cannot be empty') ||
          error.message.includes('Invalid')
        ) {
          return errorResponse('VALIDATION_ERROR', error.message, 400);
        }
      }

      return serverError('Failed to update contact settings');
    }
  });
}
