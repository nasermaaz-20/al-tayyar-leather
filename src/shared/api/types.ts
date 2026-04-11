export interface ApiErrorPayload {
  code?: string;
  message?: string;
  details?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiErrorPayload;
}

export class ApiClientError extends Error {
  status: number;
  payload?: ApiErrorPayload;

  constructor(message: string, status: number, payload?: ApiErrorPayload) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.payload = payload;
  }
}

export interface ProductImage {
  id?: string;
  url: string;
  alt: string;
  order?: number;
}

export interface Color {
  id: string;
  nameAr: string;
  nameEn: string;
  hexCode: string;
}

export interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
}

export interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  slug: string;
  price?: number | null;
  images: ProductImage[];
  colors: Color[];
  categories: Category[];
}

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  order: number;
}

export interface ContactSettings {
  whatsappNumber: string;
  tiktokUrl: string;
  addressAr: string;
  addressEn: string;
  facebookUrl?: string;
  instagramUrl?: string;
  email?: string;
}
