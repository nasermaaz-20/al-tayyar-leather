import { apiRequest } from '@/src/shared/api/http';
import type {
  Category,
  Color,
  ContactSettings,
  GalleryImage,
  Product,
} from '@/src/shared/api/types';

export interface ProductsQuery {
  categoryIds?: string[];
  colorIds?: string[];
  searchQuery?: string;
}

export async function getProducts(query: ProductsQuery = {}, locale?: string) {
  const params = new URLSearchParams();

  if (query.categoryIds?.length) {
    params.set('categoryIds', query.categoryIds.join(','));
  }
  if (query.colorIds?.length) {
    params.set('colorIds', query.colorIds.join(','));
  }
  if (query.searchQuery?.trim()) {
    params.set('searchQuery', query.searchQuery.trim());
  }

  const url = params.toString() ? `/api/products?${params.toString()}` : '/api/products';
  return apiRequest<Product[]>(url, { locale });
}

export function getProductBySlug(slug: string, locale?: string) {
  return apiRequest<Product>(`/api/products/${slug}`, { locale });
}

export function getCategories(locale?: string) {
  return apiRequest<Category[]>('/api/categories', { locale });
}

export function getColors(locale?: string) {
  return apiRequest<Color[]>('/api/colors', { locale });
}

export function getGallery(locale?: string) {
  return apiRequest<GalleryImage[]>('/api/gallery', { locale });
}

export function getContactSettings(locale?: string) {
  return apiRequest<ContactSettings>('/api/settings/contact', { locale });
}

export async function getCategoriesBilingual() {
  const [ar, en] = await Promise.all([getCategories('ar'), getCategories('en')]);
  const enMap = new Map(en.map((item: any) => [item.id, item]));
  return ar.map((item: any) => {
    const enItem = enMap.get(item.id);
    return {
      id: item.id,
      slug: item.slug || enItem?.slug || '',
      nameAr: item.name || item.nameAr || '',
      nameEn: enItem?.name || enItem?.nameEn || item.name || item.nameEn || '',
    };
  });
}

export async function getColorsBilingual() {
  const [ar, en] = await Promise.all([getColors('ar'), getColors('en')]);
  const enMap = new Map(en.map((item: any) => [item.id, item]));
  return ar.map((item: any) => {
    const enItem = enMap.get(item.id);
    return {
      id: item.id,
      hexCode: item.hexCode,
      nameAr: item.name || item.nameAr || '',
      nameEn: enItem?.name || enItem?.nameEn || item.name || item.nameEn || '',
    };
  });
}

export async function getProductsBilingual(query: ProductsQuery = {}) {
  const [ar, en] = await Promise.all([getProducts(query, 'ar'), getProducts(query, 'en')]);
  const enMap = new Map(en.map((item: any) => [item.id, item]));
  return ar.map((item: any) => {
    const enItem = enMap.get(item.id);
    return {
      ...item,
      nameAr: item.name || item.nameAr || '',
      nameEn: enItem?.name || enItem?.nameEn || item.name || item.nameEn || '',
      descAr: item.description || item.descAr || '',
      descEn: enItem?.description || enItem?.descEn || item.description || item.descEn || '',
    };
  });
}

export function generateCatalogPdf(
  productIds: string[] | undefined,
  locale: string
): Promise<Blob> {
  return apiRequest<Blob>('/api/pdf/catalog', {
    method: 'POST',
    body: { productIds, locale },
    locale,
  });
}
