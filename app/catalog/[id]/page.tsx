import { notFound } from 'next/navigation';
import {
  getAllProductIdsCached,
  getProductByIdCached,
} from '@/lib/products';
import ProductGallery from './ProductGallery';
import styles from './ProductPage.module.css';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const revalidate = 300;

export async function generateStaticParams() {
  const ids = await getAllProductIdsCached();

  return ids.map((id) => ({
    id,
  }));
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductByIdCached(id);

  if (!product) {
    notFound();
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <main className={styles.productPage}>
      <div className={styles.container}>
        <div className={styles.layout}>
          <div className={styles.imageBlock}>
            <ProductGallery title={product.title} images={product.images} />
          </div>

          <div className={styles.infoBlock}>
            <h1 className={styles.title}>{product.title}</h1>

            <p className={styles.price}>
              {product.price} <span>грн</span>
            </p>

            <p className={`${styles.stock} ${isOutOfStock ? styles.stockEmpty : ''}`}>
              {isOutOfStock ? (
                'Немає в наявності'
              ) : (
                <>
                  В наявності: <span>{product.stock}</span>
                </>
              )}
            </p>

            {product.description ? (
              <p className={styles.description}>{product.description}</p>
            ) : null}

            <div className={styles.characteristics}>
              <h2 className={styles.characteristicsTitle}>Характеристики</h2>

              {product.characteristics.length > 0 ? (
                <ul className={styles.characteristicsList}>
                  {product.characteristics.map((item) => (
                    <li
                      key={`${item.label}-${item.value}`}
                      className={styles.characteristicItem}
                    >
                      <span className={styles.characteristicLabel}>
                        {item.label}:
                      </span>{' '}
                      <span className={styles.characteristicValue}>
                        {item.value}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.description}>Характеристики ще не додані.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}