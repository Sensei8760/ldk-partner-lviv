'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './CatalogCard.module.css';
import {
  FALLBACK_PRODUCT_IMAGE,
  getPrimaryProductImage,
} from '@/utils/productImages';
import FavoriteButton from '@/components/ui/FavoriteButton';

type CatalogCardProps = {
  id: string;
  title: string;
  price: number;
  image: string;
  stock: number;
  isHit?: boolean;
};

export default function CatalogCard({
  id,
  title,
  price,
  image,
  stock,
  isHit = false,
}: CatalogCardProps) {
  const isOutOfStock = stock <= 0;

  const initialImage = useMemo(() => getPrimaryProductImage(undefined, image), [image]);
  const [currentImage, setCurrentImage] = useState(initialImage);

  return (
    <article className={`${styles.card} ${isOutOfStock ? styles.cardOutOfStock : ''}`}>
      {isHit && <span className={styles.badge}>ХІТ</span>}

      <div className={styles.favoriteButtonWrap}>
        <FavoriteButton productId={id} size="sm" />
      </div>

      <Link href={`/catalog/${id}`} className={styles.imageLink}>
        <div className={styles.imageWrapper}>
          <Image
            src={currentImage}
            alt={title}
            fill
            className={`${styles.image} ${isOutOfStock ? styles.imageOutOfStock : ''}`}
            sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => {
              if (currentImage !== FALLBACK_PRODUCT_IMAGE) {
                setCurrentImage(FALLBACK_PRODUCT_IMAGE);
              }
            }}
          />
        </div>
      </Link>

      <div className={styles.content}>
        <Link href={`/catalog/${id}`} className={styles.titleLink}>
          <h3 className={styles.title}>{title}</h3>
        </Link>

        <div className={styles.bottom}>
          <div className={styles.meta}>
            {isOutOfStock ? (
              <p className={styles.outOfStock}>Немає в наявності</p>
            ) : (
              <>
                <p className={styles.price}>
                  {price} <span>грн</span>
                </p>
                <p className={styles.stock}>В наявності: {stock}</p>
              </>
            )}
          </div>

          <Link
            href={`/catalog/${id}`}
            className={styles.cartButton}
            aria-label={`Перейти до товару ${title}`}
          >
            →
          </Link>
        </div>
      </div>
    </article>
  );
}