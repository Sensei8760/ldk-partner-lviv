import CatalogClient from '@/components/catalog/CatalogClient';
import { getProductsCached } from '@/lib/products';
import styles from './CatalogPage.module.css';

export const revalidate = 300;

export default async function CatalogPage() {
  const products = await getProductsCached();

  return (
    <main className={styles.catalogPage}>
      <div className={styles.container}>
        <h1 className={styles.title}>Каталог дверей</h1>
        <CatalogClient initialProducts={products} />
      </div>
    </main>
  );
}