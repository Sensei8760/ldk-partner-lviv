export const FALLBACK_PRODUCT_IMAGE = '/images/doors/door-1.jpg';

export function normalizeImagePath(value: unknown): string {
  return String(value || '').trim();
}

export function getSafeProductImages(images?: string[], image?: string): string[] {
  const normalizedImages = Array.isArray(images)
    ? images.map(normalizeImagePath).filter(Boolean)
    : [];

  const fallbackSingle = normalizeImagePath(image);

  const result =
    normalizedImages.length > 0
      ? normalizedImages
      : fallbackSingle
        ? [fallbackSingle]
        : [FALLBACK_PRODUCT_IMAGE];

  return [...new Set(result)];
}

export function getPrimaryProductImage(images?: string[], image?: string): string {
  return getSafeProductImages(images, image)[0] || FALLBACK_PRODUCT_IMAGE;
}