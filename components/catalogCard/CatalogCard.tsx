import Image from 'next/image';
import Link from 'next/link';
import styles from './CatalogCard.module.css';

type CatalogCardProps = {
  id: string;
  title: string;
  price: number;
  image: string;
  isHit?: boolean;
};

export default function CatalogCard({
  id,
  title,
  price,
  image,
  isHit = false,
}: CatalogCardProps) {
  return (
    <article className={styles.card}>
      {isHit && <span className={styles.badge}>ХІТ</span>}

      <Link href={`/catalog/${id}`} className={styles.imageLink}>
        <div className={styles.imageWrapper}>
          <Image
            src={image}
            alt={title}
            fill
            className={styles.image}
          />
        </div>
      </Link>

      <div className={styles.content}>
        <Link href={`/catalog/${id}`} className={styles.titleLink}>
          <h3 className={styles.title}>{title}</h3>
        </Link>

        <div className={styles.bottom}>
          <p className={styles.price}>
            {price} <span>грн</span>
          </p>

          <Link
            href={`/catalog/${id}`}
            className={styles.cartButton}
            aria-label="Перейти до товару"
          >
            →
          </Link>
        </div>
      </div>
    </article>
  );
}