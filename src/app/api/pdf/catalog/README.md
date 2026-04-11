# PDF Catalog API

## Endpoint

`POST /api/pdf/catalog`

## Description

Generates a PDF catalog of products with optional filtering. The PDF includes product images, names, descriptions, colors, and prices in the requested language (Arabic or English).

## Request

### Headers

None required (public endpoint - no authentication needed)

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `productIds` | `string[]` | No | Array of product IDs to include in the PDF. If not provided or empty, all products are included. |
| `locale` | `string` | No | Language locale for the PDF content. Must be either `'ar'` (Arabic) or `'en'` (English). Defaults to `'en'`. |

### Example Request

```json
{
  "productIds": ["prod_123", "prod_456"],
  "locale": "ar"
}
```

## Response

### Success (200 OK)

Returns a PDF file as a downloadable attachment.

**Headers:**
- `Content-Type`: `application/pdf`
- `Content-Disposition`: `attachment; filename="catalog-{locale}.pdf"`
- `Content-Length`: Size of the PDF in bytes

**Body:** Binary PDF data

### Validation Errors

#### Invalid Locale (400 Bad Request)

```json
{
  "success": false,
  "error": {
    "code": "INVALID_LOCALE",
    "message": "Locale must be either \"ar\" or \"en\""
  }
}
```

#### No Products Found (404 Not Found)

```json
{
  "success": false,
  "error": {
    "code": "NO_PRODUCTS",
    "message": "No products found to generate PDF"
  }
}
```

### Server Error (500 Internal Server Error)

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Failed to generate PDF catalog"
  }
}
```

## Usage Examples

### Generate PDF with all products (English)

```javascript
const response = await fetch('/api/pdf/catalog', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    locale: 'en'
  }),
});

if (response.ok) {
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'catalog-en.pdf';
  a.click();
}
```

### Generate PDF with filtered products (Arabic)

```javascript
const response = await fetch('/api/pdf/catalog', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    productIds: ['prod_123', 'prod_456', 'prod_789'],
    locale: 'ar'
  }),
});

if (response.ok) {
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'catalog-ar.pdf';
  a.click();
}
```

## Implementation Details

### Services Used

- **ProductService**: Fetches products from the database
- **PDFService**: Generates the PDF document with product information

### PDF Content

The generated PDF includes:
- Company logo (if available)
- Catalog title in the requested language
- For each product:
  - Product name
  - Product image (first image if multiple)
  - Price (if set)
  - Available colors
  - Product description

### Filtering Logic

1. If `productIds` is not provided, null, or an empty array, all products are included
2. If `productIds` is provided as a non-empty array, only products with matching IDs are included
3. If no products match the filter criteria, a 404 error is returned

## Requirements Validation

This endpoint validates **Requirement 6.1** from the design document:

> WHEN a customer clicks the PDF download button, THE System SHALL generate a PDF containing all visible products based on current filters

## Testing

Comprehensive unit tests are available in `__tests__/route.test.ts` covering:
- Success cases (all products, filtered products, different locales)
- Validation errors (invalid locale, no products found)
- Edge cases (empty arrays, null values, products without optional fields)
- Error handling (service failures, invalid JSON)
- Filtering logic (productIds filtering, duplicates, non-array values)
