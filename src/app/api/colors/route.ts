import { NextRequest, NextResponse } from 'next/server';
import { ColorService } from '@/src/server/services/color.service';

const colorService = new ColorService();

/**
 * GET /api/colors
 * List all colors
 * Headers:
 * - Accept-Language: locale for localized data (ar or en)
 */
export async function GET(request: NextRequest) {
  try {
    // Get all colors
    const colors = await colorService.getAll();

    // Get locale from Accept-Language header
    const locale = request.headers.get('Accept-Language')?.split(',')[0]?.split('-')[0] || 'en';
    const isArabic = locale === 'ar';

    // Transform colors to include localized data
    const localizedColors = colors.map((color) => ({
      id: color.id,
      name: isArabic ? color.nameAr : color.nameEn,
      hexCode: color.hexCode,
    }));

    return NextResponse.json({
      success: true,
      data: localizedColors,
    });
  } catch (error) {
    console.error('Error fetching colors:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch colors',
        },
      },
      { status: 500 }
    );
  }
}
