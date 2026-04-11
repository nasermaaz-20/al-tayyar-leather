import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/src/server/services/product.service';
import { pdfService } from '@/src/server/services/pdf.service';

/**
 * POST /api/pdf/catalog
 * Generate PDF catalog with filtered products
 * Body:
 * - productIds: optional array of product IDs to include
 * - locale: language locale ('ar' or 'en')
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productIds, locale = 'en' } = body || {};

    // Validate locale
    if (locale !== 'ar' && locale !== 'en') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_LOCALE',
            message: 'Locale must be either "ar" or "en"',
          },
        },
        { status: 400 }
      );
    }

    // Fetch products
    const allProducts = await productService.getAll();
    let products = allProducts;

    // Filter by productIds if provided
    if (productIds && Array.isArray(productIds) && productIds.length > 0) {
      products = allProducts.filter((product) => productIds.includes(product.id));
    }

    // Check if we have products to generate PDF
    if (!products || products.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_PRODUCTS',
            message: 'No products found to generate PDF',
          },
        },
        { status: 404 }
      );
    }

    // Convert Decimal prices to numbers for PDF generation
    const productsForPdf = products.map(product => ({
      ...product,
      price: product.price ? Number(product.price) : null,
    }));

    // Generate PDF
    const pdfBuffer = await pdfService.generateCatalog(productsForPdf, locale);

    // Return PDF as downloadable file
    const filename = locale === 'ar' ? 'catalog-ar.pdf' : 'catalog-en.pdf';
    
    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating PDF catalog:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to generate PDF catalog',
        },
      },
      { status: 500 }
    );
  }
}
