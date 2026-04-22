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
  discountPrice?: number | null;
  image: string;
  images?: string[];
  stock: number;
  isHit?: boolean;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat('uk-UA').format(value);
}

export default function CatalogCard({
  id,
  title,
  price,
  discountPrice = null,
  image,
  images = [],
  stock,
  isHit = false,
}: CatalogCardProps) {
  const isOutOfStock = stock <= 0;
  const [isHovered, setIsHovered] = useState(false);
  const [secondImageFailed, setSecondImageFailed] = useState(false);
  const [primaryImageFailed, setPrimaryImageFailed] = useState(false);

  const hasDiscount =
    discountPrice !== null &&
    discountPrice !== undefined &&
    discountPrice > 0 &&
    discountPrice < price;

  const displayPrice = hasDiscount ? discountPrice : price;

  const normalizedImages = useMemo(() => {
    return Array.isArray(images)
      ? images.map((item) => String(item).trim()).filter(Boolean)
      : [];
  }, [images]);

  const primaryImage = useMemo(() => {
    return getPrimaryProductImage(normalizedImages, image);
  }, [normalizedImages, image]);

  const secondaryImage = useMemo(() => {
    return normalizedImages.find((item) => item !== primaryImage) || '';
  }, [normalizedImages, primaryImage]);

  const displayPrimaryImage = primaryImageFailed
    ? FALLBACK_PRODUCT_IMAGE
    : primaryImage;

  const shouldShowSecondImage =
    isHovered && Boolean(secondaryImage) && !secondImageFailed;

  const currentImage = shouldShowSecondImage
    ? secondaryImage
    : displayPrimaryImage;

  return (
    <article className={`${styles.card} ${isOutOfStock ? styles.cardOutOfStock : ''}`}>
      {isHit ? <span className={styles.badge}>ХІТ</span> : null}

      <div className={styles.favoriteButtonWrap}>
        <FavoriteButton productId={id} size="sm" />
      </div>

      <Link
        href={`/catalog/${id}`}
        className={styles.imageLink}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={styles.imageWrapper}>
          <Image
            src={currentImage}
            alt={title}
            fill
            className={`${styles.image} ${isOutOfStock ? styles.imageOutOfStock : ''}`}
            sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => {
              if (shouldShowSecondImage) {
                setSecondImageFailed(true);
                return;
              }

              if (displayPrimaryImage !== FALLBACK_PRODUCT_IMAGE) {
                setPrimaryImageFailed(true);
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
            {hasDiscount ? (
              <div className={styles.priceDiscountRow}>
                <p className={styles.priceOld}>
                  <span className={styles.priceOldValue}>{formatPrice(price)}</span>{' '}
                  <span className={styles.priceOldCurrency}>грн</span>
                </p>

                <p className={styles.priceSale}>
                  <span className={styles.priceSaleValue}>
                    {formatPrice(displayPrice)}
                  </span>{' '}
                  <span className={styles.priceSaleCurrency}>грн</span>
                </p>
              </div>
            ) : (
              <p className={styles.price}>
                <span className={styles.priceValue}>{formatPrice(price)}</span>{' '}
                <span className={styles.currency}>грн</span>
              </p>
            )}

            <p className={`${styles.stock} ${isOutOfStock ? styles.stockOut : ''}`}>
              {isOutOfStock ? 'Немає в наявності' : `В наявності: ${stock}`}
            </p>
          </div>

          <Link
            href={`/catalog/${id}`}
            className={`${styles.arrowButton} ${
              isOutOfStock ? styles.arrowButtonDisabled : ''
            }`}
            aria-label={`Перейти до товару ${title}`}
          >
            <svg className={styles.arrowIcon} aria-hidden="true">
              <use href="/icons/symbol-defs.svg?v=6#icon-fi-rs-arrow-right" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}