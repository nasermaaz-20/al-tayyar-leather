import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/src/server/services/product.service';

const productService = new ProductService();

/**
 * GET /api/products/[slug]
 * Get single product by slug
 * Headers:
 * - Accept-Language: locale for localized data (ar or en)
 */
export async function GET(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const { slug } = params;

    // Get product by slug
    const product = await productService.getBySlug(slug);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Product not found',
          },
        },
        { status: 404 }
      );
    }

    // Get locale from Accept-Language header
    const locale = request.headers.get('Accept-Language')?.split(',')[0]?.split('-')[0] || 'en';
    const isArabic = locale === 'ar';

    // Transform product to include localized data
    const localizedProduct = {
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
    };

    return NextResponse.json({
      success: true,
      data: localizedProduct,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch product',
        },
      },
      { status: 500 }
    );
  }
}
