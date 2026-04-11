import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/src/server/services/product.service';

const productService = new ProductService();

/**
 * GET /api/products
 * List all products with optional filters
 * Query parameters:
 * - categoryIds: comma-separated category IDs
 * - colorIds: comma-separated color IDs
 * - searchQuery: search term for product names and descriptions
 * Headers:
 * - Accept-Language: locale for localized data (ar or en)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse filter parameters
    const categoryIds = searchParams.get('categoryIds')?.split(',').filter(Boolean);
    const colorIds = searchParams.get('colorIds')?.split(',').filter(Boolean);
    const searchQuery = searchParams.get('searchQuery') || undefined;

    // Get products with filters
    const products = await productService.getAll({
      categoryIds,
      colorIds,
      searchQuery,
    });

    // Get locale from Accept-Language header
    const locale = request.headers.get('Accept-Language')?.split(',')[0]?.split('-')[0] || 'en';
    const isArabic = locale === 'ar';

    // Transform products to include localized data
    const localizedProducts = products.map((product) => ({
      id: product.id,
      name: isArabic ? product.nameAr : product.nameEn,
      description: isArabic ? product.descAr : product.descEn,
      price: product.price ? Number(product.price) : null,
      slug: product.slug,
      images: product.images,
      colors: product.colors.map((color) => ({
        id: color.id,
        name: isArabic ? color.nameAr : color.nameEn,
        hexCode: color.hexCode,
      })),
      categories: product.categories.map((category) => ({
        id: category.id,
        name: isArabic ? category.nameAr : category.nameEn,
        slug: category.slug,
      })),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: localizedProducts,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch products',
        },
      },
      { status: 500 }
    );
  }
}
