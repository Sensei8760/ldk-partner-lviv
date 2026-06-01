'use client';

import { useEffect, useState } from 'react';
import styles from './ProductPage.module.css';

type Characteristic = {
  label: string;
  value: string;
};

type ProductCharacteristicsProps = {
  characteristics: Characteristic[];
};

const MOBILE_VISIBLE_COUNT = 5;
const MOBILE_BREAKPOINT = 560;

export default function ProductCharacteristics({
  characteristics,
}: ProductCharacteristicsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT;

      setIsMobile(mobile);

      if (!mobile) {
        setIsExpanded(true);
      } else {
        setIsExpanded(false);
      }
    };

    checkMobile();

    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const shouldShowButton =
    isMobile && characteristics.length > MOBILE_VISIBLE_COUNT;

  return (
    <div className={styles.characteristics}>
      <h2 className={styles.characteristicsTitle}>Характеристики</h2>

      {characteristics.length > 0 ? (
        <>
          <div
            className={`${styles.characteristicsListWrap} ${
              isExpanded || !isMobile
                ? styles.characteristicsListWrapOpen
                : ''
            }`}
          >
            <ul className={styles.characteristicsList}>
              {characteristics.map((item) => (
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
          </div>

          {shouldShowButton && (
            <button
              type="button"
              className={styles.showAllCharacteristics}
              onClick={() => setIsExpanded((prev) => !prev)}
            >
              {isExpanded
                ? 'Сховати характеристики'
                : 'Показати всі характеристики'}

              <svg
                className={`${styles.showAllCharacteristicsIcon} ${
                  isExpanded ? styles.showAllCharacteristicsIconOpen : ''
                }`}
                aria-hidden="true"
              >
                <use href="/icons/symbol-defs.svg?v=6#arrow_back_ios_new" />
              </svg>
            </button>
          )}
        </>
      ) : (
        <p className={styles.description}>Характеристики ще не додані.</p>
      )}
    </div>
  );
}