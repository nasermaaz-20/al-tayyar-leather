import { apiRequest } from '@/src/shared/api/http';
import type { Category, Color, ContactSettings, GalleryImage, Product } from '@/src/shared/api/types';

export function createColor(payload: Pick<Color, 'nameAr' | 'nameEn' | 'hexCode'>) {
  return apiRequest<Color>('/api/admin/colors', { method: 'POST', body: payload });
}

export function updateColor(
  id: string,
  payload: Partial<Pick<Color, 'nameAr' | 'nameEn' | 'hexCode'>>
) {
  return apiRequest<Color>(`/api/admin/colors/${id}`, { method: 'PUT', body: payload });
}

export function deleteColor(id: string) {
  return apiRequest<{ id: string }>(`/api/admin/colors/${id}`, { method: 'DELETE' });
}

export function updateContactSettings(payload: Partial<ContactSettings>) {
  return apiRequest<ContactSettings>('/api/admin/settings/contact', {
    method: 'PUT',
    body: payload,
  });
}

export function createGalleryImage(payload: Pick<GalleryImage, 'url' | 'alt'>) {
  return apiRequest<GalleryImage>('/api/admin/gallery', { method: 'POST', body: payload });
}

export function deleteGalleryImage(id: string) {
  return apiRequest<{ id: string }>(`/api/admin/gallery/${id}`, { method: 'DELETE' });
}

export function reorderGalleryImages(imageIds: string[]) {
  return apiRequest<{ count: number }>('/api/admin/gallery/reorder', {
    method: 'PUT',
    body: { imageIds },
  });
}

export function deleteProduct(id: string) {
  return apiRequest<Product>(`/api/admin/products/${id}`, { method: 'DELETE' });
}

export function createProduct(payload: {
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  price: number | null;
  categoryIds: string[];
  colorIds: string[];
  images: Array<{ url: string; alt: string; order: number }>;
}) {
  return apiRequest<Product>('/api/admin/products', { method: 'POST', body: payload });
}

export function updateProduct(
  id: string,
  payload: {
    nameAr: string;
    nameEn: string;
    descAr: string;
    descEn: string;
    price: number | null;
    categoryIds: string[];
    colorIds: string[];
    images: Array<{ url: string; alt: string; order: number }>;
  }
) {
  return apiRequest<Product>(`/api/admin/products/${id}`, { method: 'PUT', body: payload });
}

export function createCategory(payload: Pick<Category, 'nameAr' | 'nameEn'>) {
  return apiRequest<Category>('/api/admin/categories', { method: 'POST', body: payload });
}

export function updateCategory(id: string, payload: Partial<Pick<Category, 'nameAr' | 'nameEn'>>) {
  return apiRequest<Category>(`/api/admin/categories/${id}`, { method: 'PUT', body: payload });
}

export function deleteCategory(id: string) {
  return apiRequest<{ id: string }>(`/api/admin/categories/${id}`, { method: 'DELETE' });
}
