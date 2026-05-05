import type { MetadataRoute } from 'next';

const SITE_URL = 'https://ldk-partner-lviv.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/catalog/login-staff'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}