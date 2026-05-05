import type { Metadata } from 'next';
import CatalogClient from '@/components/catalog/CatalogClient';
import { getProductsCached } from '@/lib/products';
import styles from './CatalogPage.module.css';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Каталог дверей',
  description:
    'Каталог вхідних та міжкімнатних дверей LDK Partner у Львові. Фільтруйте двері за типом, розміром, відкриванням, стилем і ціною.',
  alternates: {
    canonical: '/catalog',
  },
  openGraph: {
    title: 'Каталог дверей | LDK Partner Львів',
    description:
      'Вхідні та міжкімнатні двері в каталозі LDK Partner. Оберіть модель, розмір, стиль і перевірте наявність.',
    url: '/catalog',
    images: [
      {
        url: '/images/image-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Каталог дверей LDK Partner Львів',
      },
    ],
  },
};

type CatalogPageProps = {
  searchParams: Promise<{
    type?: string;
  }>;
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const products = await getProductsCached();
  const params = await searchParams;

  const typeFromUrl = params.type || 'all';

  return (
    <main className={styles.catalogPage}>
      <div className={styles.container}>
        <h1 className={styles.title}>Каталог дверей</h1>

        <CatalogClient key={typeFromUrl} initialProducts={products} />
      </div>
    </main>
  );
}