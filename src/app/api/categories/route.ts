import { NextRequest, NextResponse } from 'next/server';
import { CategoryService } from '@/src/server/services/category.service';

const categoryService = new CategoryService();

/**
 * GET /api/categories
 * List all categories
 * Headers:
 * - Accept-Language: locale for localized data (ar or en)
 */
export async function GET(request: NextRequest) {
  try {
    // Get all categories
    const categories = await categoryService.getAll();

    // Get locale from Accept-Language header
    const locale = request.headers.get('Accept-Language')?.split(',')[0]?.split('-')[0] || 'en';
    const isArabic = locale === 'ar';

    // Transform categories to include localized data
    const localizedCategories = categories.map((category) => ({
      id: category.id,
      name: isArabic ? category.nameAr : category.nameEn,
      slug: category.slug,
    }));

    return NextResponse.json({
      success: true,
      data: localizedCategories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch categories',
        },
      },
      { status: 500 }
    );
  }
}
