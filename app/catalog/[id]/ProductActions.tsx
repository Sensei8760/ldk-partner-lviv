'use client';

import FavoriteButton from '@/components/ui/FavoriteButton';
import styles from './ProductPage.module.css';

type ProductSizeDisplayItem = {
  size: '850x2040' | '950x2040' | '1200x2040';
  leftStock: number | null;
  rightStock: number | null;
  stock: number | null;
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

      {sizeStocks.length > 0 ? (
        <div className={styles.sizeAvailability}>
          <p className={styles.sizeAvailabilityTitle}>Доступні розміри</p>

          <div className={styles.sizeAvailabilityList}>
            {sizeStocks.map((item) => {
              const leftStock =
                item.leftStock === null ? null : Math.max(0, Number(item.leftStock) || 0);
              const rightStock =
                item.rightStock === null ? null : Math.max(0, Number(item.rightStock) || 0);
              const totalStock =
                item.stock === null ? null : Math.max(0, Number(item.stock) || 0);

              const isOut = totalStock !== null && totalStock <= 0;

              return (
                <div
                  key={item.size}
                  className={`${styles.sizeAvailabilityItem} ${
                    isOut ? styles.sizeAvailabilityItemOut : ''
                  }`}
                >
                  <span className={styles.sizeAvailabilityName}>
                    {sizeLabels[item.size]}
                  </span>

                  <span
                    className={`${styles.sizeAvailabilityStock} ${
                      isOut ? styles.sizeAvailabilityStockOut : ''
                    }`}
                  >
                    {leftStock === null && rightStock === null ? (
                      'Кількість не вказана'
                    ) : (
                      <>
                        Ліве: {leftStock ?? 0}
                        <br />
                        Праве: {rightStock ?? 0}
                      </>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}