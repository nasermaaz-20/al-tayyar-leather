import { NextRequest, NextResponse } from 'next/server';
import { settingsService } from '@/src/server/services/settings.service';

/**
 * GET /api/settings/contact
 * Get contact settings (WhatsApp, TikTok, address)
 * Headers:
 * - Accept-Language: locale for localized address (ar or en)
 * 
 * Requirements: 8.4, 9.2, 9.3
 */
export async function GET(request: NextRequest) {
  try {
    // Get contact settings from service
    const settings = await settingsService.getContactSettings();

    // Get locale from Accept-Language header
    const locale = request.headers.get('Accept-Language')?.split(',')[0]?.split('-')[0] || 'en';
    const isArabic = locale === 'ar';

    // Return localized response
    return NextResponse.json({
      success: true,
      data: {
        whatsappNumber: settings.whatsappNumber,
        tiktokUrl: settings.tiktokUrl,
        address: isArabic ? settings.addressAr : settings.addressEn,
        addressAr: settings.addressAr,
        addressEn: settings.addressEn,
        facebookUrl: settings.facebookUrl,
        instagramUrl: settings.instagramUrl,
        email: settings.email,
      },
    });
  } catch (error) {
    console.error('Error fetching contact settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch contact settings',
        },
      },
      { status: 500 }
    );
  }
}
