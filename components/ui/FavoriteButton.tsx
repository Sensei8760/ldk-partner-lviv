'use client';

import { useEffect, useState } from 'react';
import styles from './FavoriteButton.module.css';
import { getFavoriteIds, toggleFavorite } from '@/store/favorites';

type FavoriteButtonProps = {
  productId: string;
  className?: string;
  size?: 'sm' | 'md';
  showText?: boolean;
};

export default function FavoriteButton({
  productId,
  className = '',
  size = 'md',
  showText = false,
}: FavoriteButtonProps) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    const syncFavorites = () => {
      setFavoriteIds(getFavoriteIds());
    };

    syncFavorites();

    window.addEventListener('favorites-changed', syncFavorites);
    window.addEventListener('storage', syncFavorites);

    return () => {
      window.removeEventListener('favorites-changed', syncFavorites);
      window.removeEventListener('storage', syncFavorites);
    };
  }, []);

  const active = favoriteIds.includes(productId);

  return (
    <button
      type="button"
      className={`${styles.button} ${styles[size]} ${active ? styles.active : ''} ${className}`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setFavoriteIds(toggleFavorite(productId));
      }}
      aria-label={active ? 'Прибрати зі збережених' : 'Додати до збережених'}
      title={active ? 'Прибрати зі збережених' : 'Додати до збережених'}
    >
      <span className={styles.icon} aria-hidden="true">
        <svg className={styles.iconSvg}>
          <use href="/icons/symbol-defs.svg?v=6#icon-fi-rr-star" />
        </svg>
      </span>

      {showText ? (
        <span className={styles.text}>
          {active ? 'Збережено' : 'Зберегти'}
        </span>
      ) : null}
    </button>
  );
}