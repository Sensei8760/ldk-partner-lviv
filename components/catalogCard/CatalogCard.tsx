import Image from 'next/image';
import styles from './CatalogCard.module.css';

type CatalogCardProps = {
  id: string;
  title: string;
  price: number;
  image: string;
  isHit?: boolean;
};

export default function CatalogCard({
  title,
  price,
  image,
  isHit = false,
}: CatalogCardProps) {
  return (
    <article className={styles.card}>
      {isHit && <span className={styles.badge}>ХІТ</span>}

      <div className={styles.imageWrapper}>
        <Image
          src={image}
          alt={title}
          fill
          className={styles.image}
        />
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>

        <div className={styles.bottom}>
          <p className={styles.price}>
            {price} <span>грн</span>
          </p>

          <button className={styles.cartButton} aria-label="Додати в кошик">
            🛒
          </button>
        </div>
      </div>
    </article>
  );
}