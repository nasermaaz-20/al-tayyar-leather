import type { ApiErrorPayload, ApiResponse } from '@/src/shared/api/types';
import { ApiClientError } from '@/src/shared/api/types';

type ApiRequestOptions = Omit<RequestInit, 'body' | 'headers'> & {
  body?: unknown;
  headers?: HeadersInit;
  locale?: string;
};

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { body, headers, locale, ...rest } = options;
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has('Content-Type') && body && !(body instanceof FormData)) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (locale) {
    requestHeaders.set('Accept-Language', locale);
  }

  // Automatically prepend base URL for Server Components
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') return ''; // Browser uses relative url
    if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return 'http://localhost:3000'; // Default local absolute URL
  };

  const url = path.startsWith('http') ? path : `${getBaseUrl()}${path}`;

  const response = await fetch(url, {
    ...rest,
    headers: requestHeaders,
    body:
      body instanceof FormData || typeof body === 'string'
        ? body
        : body
          ? JSON.stringify(body)
          : undefined,
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (response.ok && !isJson) {
    return (await response.blob()) as T;
  }

  const payload = isJson
    ? ((await response.json()) as ApiResponse<T>)
    : ({ success: false } as ApiResponse<T>);

  if (!response.ok || !payload.success) {
    const errorPayload = payload.error as ApiErrorPayload | undefined;
    const message =
      errorPayload?.message ||
      (response.status === 404 ? 'Resource not found' : 'Request failed');

    throw new ApiClientError(message, response.status, errorPayload);
  }

  return payload.data as T;
}
