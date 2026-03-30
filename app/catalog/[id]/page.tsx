import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/products';
import styles from './ProductPage.module.css';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <main className={styles.productPage}>
      <div className={styles.container}>
        <div className={styles.layout}>
          <div className={styles.imageBlock}>
            <div className={styles.imageWrapper}>
              <Image
                src={product.image}
                alt={product.title}
                fill
                className={styles.image}
                priority
              />
            </div>
          </div>

          <div className={styles.infoBlock}>
            <h1 className={styles.title}>{product.title}</h1>

            <p className={styles.price}>
              {product.price} <span>грн</span>
            </p>

            <p className={styles.stock}>
              В наявності: <span>{product.stock}</span>
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