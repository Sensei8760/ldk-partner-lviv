'use client';

import FavoriteButton from '@/components/ui/FavoriteButton';
import styles from './ProductPage.module.css';

type ProductSizeDisplayItem = {
  size: '850x2040' | '950x2040' | '1200x2040';
  leftStock: number;
  rightStock: number;
  stock: number;
};

type ProductActionsProps = {
  productId: string;
  sizeStocks: ProductSizeDisplayItem[];
};

const sizeLabels: Record<ProductSizeDisplayItem['size'], string> = {
  '850x2040': '850х2040 мм',
  '950x2040': '950х2040 мм',
  '1200x2040': '1200х2040 мм',
};

export default function ProductActions({
  productId,
  sizeStocks,
}: ProductActionsProps) {
  return (
    <div className={styles.actionsSection}>
      <div className={styles.actions}>
        <FavoriteButton productId={productId} size="md" showText />
      </div>

      <div className={styles.sizeAvailability}>
        <p className={styles.sizeAvailabilityTitle}>Доступні розміри</p>

        <div className={styles.sizeAvailabilityList}>
          {sizeStocks.map((item) => {
            const leftStock = Math.max(0, Number(item.leftStock) || 0);
            const rightStock = Math.max(0, Number(item.rightStock) || 0);

            return (
              <div key={item.size} className={styles.sizeAvailabilityItem}>
                <span className={styles.sizeAvailabilityName}>
                  {sizeLabels[item.size]}
                </span>

                <span className={styles.sizeAvailabilityStock}>
                  Ліве: {leftStock > 0 ? leftStock : 'під замовлення'}
                  <br />
                  Праве: {rightStock > 0 ? rightStock : 'під замовлення'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}