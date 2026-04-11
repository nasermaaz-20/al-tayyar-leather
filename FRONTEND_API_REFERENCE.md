# Frontend API Reference

This document stores the way the previous frontend communicated with the backend, specifically preserving all the API client functions and routes, before the frontend files were deleted.

## 1. Public API (Data Fetching)
The frontend fetched public data from the Next.js API Routes (Server App).

- **Products**: 
  - `GET /api/products` (Accepts `categoryIds`, `colorIds`, `searchQuery` as query params)
  - `GET /api/products/[slug]` (Fetch by slug)
- **Categories**: `GET /api/categories`
- **Colors**: `GET /api/colors`
- **Gallery**: `GET /api/gallery`
- **Settings**: `GET /api/settings/contact`
- **PDF Catalog**: `POST /api/pdf/catalog` (Body: `{ productIds, locale }`)

The frontend also used bilingual fetch wrappers (e.g., `getCategoriesBilingual()`) which would fetch twice (for `ar` and `en`) and merge the values together.

## 2. Admin API (Mutations & Management)
Admin requests were sent with standard methods.

### Colors
- `POST /api/admin/colors` (Body: `nameAr`, `nameEn`, `hexCode`)
- `PUT /api/admin/colors/[id]` (Body: `nameAr`, `nameEn`, `hexCode`)
- `DELETE /api/admin/colors/[id]`

### Settings
- `PUT /api/admin/settings/contact` (Body: `ContactSettings`)

### Gallery
- `POST /api/admin/gallery` (Body: `url`, `alt`)
- `PUT /api/admin/gallery/reorder` (Body: `{ imageIds: string[] }`)
- `DELETE /api/admin/gallery/[id]`

### Products
- `POST /api/admin/products` (Body: `nameAr`, `nameEn`, `descAr`, `descEn`, `price`, `categoryIds`, `colorIds`, `images`)
- `PUT /api/admin/products/[id]` 
- `DELETE /api/admin/products/[id]`

### Categories
- `POST /api/admin/categories` (Body: `nameAr`, `nameEn`)
- `PUT /api/admin/categories/[id]`
- `DELETE /api/admin/categories/[id]`

## 3. Request Configuration
Requests were handled via a central `apiRequest` handler that automatically:
- Attached the `{ locale }` via `Accept-Language` headers.
- Set `Content-Type: application/json` unless body was `FormData`.
- Parsed JSON vs Blob (e.g., for the PDF generation route).
- Threw a standardized `ApiClientError`.
