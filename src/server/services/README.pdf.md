# PDFService Documentation

## Overview

The `PDFService` provides functionality to generate professional PDF catalogs of leather products with bilingual support (Arabic RTL and English LTR layouts).

## Features

- ✅ Bilingual support (Arabic RTL / English LTR)
- ✅ Professional branding with logo integration
- ✅ Product images, names, descriptions, colors, and prices
- ✅ Graceful handling of missing images
- ✅ Brand colors from logo (Saddle Brown, Chocolate, Peru/Tan, Goldenrod)
- ✅ A4 page format with proper margins
- ✅ Multiple products with automatic pagination

## Usage

### Basic Example

```typescript
import { pdfService } from '@/lib/services/pdf.service';
import { productService } from '@/lib/services/product.service';

// Get products
const products = await productService.getAll();

// Generate PDF catalog in English
const pdfBuffer = await pdfService.generateCatalog(products, 'en');

// Generate PDF catalog in Arabic
const pdfBufferAr = await pdfService.generateCatalog(products, 'ar');
```

### API Route Example

```typescript
// app/api/pdf/catalog/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { pdfService } from '@/lib/services/pdf.service';
import { productService } from '@/lib/services/product.service';

export async function POST(request: NextRequest) {
  try {
    const { locale, productIds } = await request.json();
    
    // Get products (optionally filtered by IDs)
    let products = await productService.getAll();
    
    if (productIds && productIds.length > 0) {
      products = products.filter(p => productIds.includes(p.id));
    }
    
    // Generate PDF
    const pdfBuffer = await pdfService.generateCatalog(products, locale || 'en');
    
    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="catalog-${locale}.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
```

### With Filters

```typescript
import { pdfService } from '@/lib/services/pdf.service';
import { productService } from '@/lib/services/product.service';

// Get filtered products
const products = await productService.getAll({
  categoryIds: ['cat_1', 'cat_2'],
  colorIds: ['color_1'],
});

// Generate PDF with filtered products
const pdfBuffer = await pdfService.generateCatalog(products, 'en');
```

## Product Data Structure

The service expects products with the following structure:

```typescript
interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  price?: number | null;
  images: Array<{
    url: string;
    alt: string;
    order: number;
  }>;
  colors: Array<{
    nameAr: string;
    nameEn: string;
    hexCode: string;
  }>;
  categories: Array<{
    nameAr: string;
    nameEn: string;
  }>;
}
```

## Locale Support

- `'en'` - English (LTR layout)
- `'ar'` - Arabic (RTL layout)

## PDF Layout

### Header
- Logo (centered, 80x80px)
- Catalog title in selected language
- Decorative gold line

### Product Page
Each product gets its own page with:
- Product name (18pt, primary color)
- Product image (200x200px, if available)
- Price (14pt, gold color, if set)
- Available colors (12pt, with color names)
- Description (11pt, light text)
- Decorative bottom border

## Brand Colors

The PDF uses the following brand colors from the logo:

```typescript
const COLORS = {
  primary: '#8B4513',    // Saddle Brown
  secondary: '#D2691E',  // Chocolate
  accent: '#CD853F',     // Peru/Tan
  gold: '#DAA520',       // Goldenrod
  text: '#333333',
  lightText: '#666666',
  border: '#E5E5E5',
};
```

## Error Handling

The service gracefully handles:
- Missing logo file (continues without logo)
- Missing product images (skips image, continues with text)
- Empty product lists (generates PDF with header only)
- Products without prices (omits price section)
- Products without colors (omits colors section)

## Requirements Validation

This implementation validates the following requirements:

- **6.1**: PDF contains all visible products based on filters
- **6.2**: Includes product images, names, and descriptions in selected language
- **6.3**: Includes available colors for each product
- **6.4**: Includes prices for products that have prices set
- **10.2**: Displays content in Arabic with RTL layout when locale is 'ar'
- **10.3**: Displays content in English with LTR layout when locale is 'en'

## Testing

The service includes comprehensive unit tests covering:
- PDF generation for both locales
- Multiple products
- Products without prices, images, or colors
- Empty product lists
- Long descriptions
- Special characters
- Missing files (logo, images)
- RTL/LTR layouts
- Bilingual content

Run tests:
```bash
npm test -- lib/services/__tests__/pdf.service.test.ts
```

## Dependencies

- `pdfkit` - PDF generation library
- `@types/pdfkit` - TypeScript types for PDFKit
- `fs` - File system access for images
- `path` - Path utilities

## Notes

- Images are loaded from the file system using absolute paths
- The logo should be placed at `/img/logo.jpg`
- Product images should be in `/public/uploads/products/`
- PDFs are generated in-memory and returned as Buffer objects
- Each product gets its own page for better readability
