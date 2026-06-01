'use client';

import styles from './ProductPage.module.css';

type ProductSizeDisplayItem = {
  size: '850x2040' | '950x2040' | '1200x2040';
  leftStock: number;
  rightStock: number;
  stock: number;
};

type ProductActionsProps = {
  sizeStocks: ProductSizeDisplayItem[];
};

const sizeLabels: Record<ProductSizeDisplayItem['size'], string> = {
  '850x2040': '850х2040 мм',
  '950x2040': '950х2040 мм',
  '1200x2040': '1200х2040 мм',
};

export default function ProductActions({ sizeStocks }: ProductActionsProps) {
  return (
    <div className={styles.sizeAvailability}>
      <h2 className={styles.sizeAvailabilityTitle}>Розміри</h2>

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
  );
}