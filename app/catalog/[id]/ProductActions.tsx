'use client';

import FavoriteButton from '@/components/ui/FavoriteButton';
import styles from './ProductPage.module.css';

type ProductActionsProps = {
  productId: string;
};

export default function ProductActions({ productId }: ProductActionsProps) {
  return (
    <div className={styles.actions}>
      <FavoriteButton productId={productId} size="md" showText />
    </div>
  );
}