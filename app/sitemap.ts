import type { MetadataRoute } from 'next';
import { getProductsCached } from '@/lib/products';

const SITE_URL = 'https://ldk-partner-lviv.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProductsCached();
  const now = new Date();

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/catalog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...products.map((product) => ({
      url: `${SITE_URL}/catalog/${product.id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}