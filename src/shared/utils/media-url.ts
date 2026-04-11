export function normalizeMediaUrl(url?: string | null): string {
  if (!url) return '/img/placeholder.jpg';

  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
    return url;
  }

  const normalized = url.replace(/\\/g, '/').replace(/^public\//, '');
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
}
