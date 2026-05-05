import CatalogClient from '@/components/catalog/CatalogClient';
import { getProductsCached } from '@/lib/products';
import styles from './CatalogPage.module.css';

export const revalidate = 300;

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

        <CatalogClient
          key={typeFromUrl}
          initialProducts={products}
        />
      </div>
    </main>
  );
}