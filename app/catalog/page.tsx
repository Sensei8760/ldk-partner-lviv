'use client';

import { useEffect, useMemo, useState } from 'react';
import CatalogCard from '@/components/catalogCard/CatalogCard';
import styles from './CatalogPage.module.css';

type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  description: string;
  type: 'street' | 'apartment';
  styles: string[];
  stock: number;
  isHit: boolean;
  characteristics: { label: string; value: string }[];
};

const typeItems = [
  { id: 'street', label: 'Вулиця' },
  { id: 'apartment', label: 'Квартира' },
];

const styleItems = [
  { id: 'portala', label: 'ПОРТАЛА' },
  { id: 'dpm-mk', label: 'ДПМ+МК' },
  { id: 'komfort-new', label: 'Комфорт NEW' },
  { id: 'elegant-new', label: 'Елегант NEW' },
  { id: 'koncept', label: 'Концепт' },
  { id: 'modern', label: 'Модерн' },
  { id: 'lux', label: 'ЛЮКС' },
  { id: 'trio-light', label: 'ТРІО ЛАЙТ' },
  { id: 'trio', label: 'ТРІО' },
  { id: 'trio-termo', label: 'ТРІО ТЕРМО' },
  { id: 'trio-mottura', label: 'ТРІО MOTTURA' },
  { id: 'kvadro', label: 'Квадро' },
  { id: 'strit', label: 'Стріт' },
  { id: 'strit-termo', label: 'Стріт ТЕРМО' },
  { id: 'prof-guard', label: 'PROF GUARD' },
  { id: 'fire-econom-epik', label: 'Протипожежні + Економ + Епік' },
  { id: 'sale', label: 'РОЗПРОДАЖ' },
  { id: 'sale-premium-new', label: 'РОЗПРОДАЖ Преміум NEW' },
];

const VISIBLE_COUNT = 5;

function normalizeValue(value: string) {
  return value.trim().toLowerCase();
}

export default function CatalogPage() {
  const [showAllStyles, setShowAllStyles] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        setIsLoading(true);
        setErrorText('');

        const response = await fetch('/api/products', {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Не вдалося завантажити товари.');
        }

        const data = await response.json();

        if (isMounted) {
          setProducts(Array.isArray(data.products) ? data.products : []);
        }
      } catch {
        if (isMounted) {
          setErrorText('Не вдалося завантажити каталог.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleStyles = showAllStyles
    ? styleItems
    : styleItems.slice(0, VISIBLE_COUNT);

  const typeCounts = useMemo(() => {
    return {
      street: products.filter((product) => product.type === 'street').length,
      apartment: products.filter((product) => product.type === 'apartment').length,
    };
  }, [products]);

  const styleCounts = useMemo(() => {
    return styleItems.reduce<Record<string, number>>((acc, item) => {
      acc[item.id] = products.filter((product) =>
        product.styles.some(
          (style) => normalizeValue(style) === normalizeValue(item.label)
        )
      ).length;

      return acc;
    }, {});
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesType =
        selectedTypes.length === 0 || selectedTypes.includes(product.type);

      const matchesStyle =
        selectedStyles.length === 0 ||
        selectedStyles.some((styleId) => {
          const style = styleItems.find((item) => item.id === styleId);

          return style
            ? product.styles.some(
                (productStyle) =>
                  normalizeValue(productStyle) === normalizeValue(style.label)
              )
            : false;
        });

      return matchesType && matchesStyle;
    });
  }, [products, selectedTypes, selectedStyles]);

  const handleToggleType = (id: string) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleStyle = (id: string) => {
    setSelectedStyles((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <main className={styles.catalogPage}>
      <div className={styles.container}>
        <h1 className={styles.title}>Каталог дверей</h1>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <h2 className={styles.sidebarTitle}>Фільтри</h2>

            <div className={styles.filterGroup}>
              <h3 className={styles.groupTitle}>Тип</h3>

              <div className={styles.filtersList}>
                {typeItems.map((item) => {
                  const isChecked = selectedTypes.includes(item.id);
                  const count =
                    item.id === 'street'
                      ? typeCounts.street
                      : typeCounts.apartment;

                  return (
                    <label key={item.id} className={styles.filterLabel}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleType(item.id)}
                        className={styles.checkbox}
                      />

                      <span className={styles.customCheckbox}></span>

                      <span className={styles.filterText}>
                        <span
                          className={`${styles.filterName} ${
                            isChecked ? styles.filterNameActive : ''
                          }`}
                        >
                          {item.label}
                        </span>
                        <span className={styles.count}>({count})</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <h3 className={styles.groupTitle}>Стилі</h3>

              <div className={styles.filtersList}>
                {visibleStyles.map((item) => {
                  const isChecked = selectedStyles.includes(item.id);
                  const count = styleCounts[item.id] || 0;

                  return (
                    <label key={item.id} className={styles.filterLabel}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleStyle(item.id)}
                        className={styles.checkbox}
                      />

                      <span className={styles.customCheckbox}></span>

                      <span className={styles.filterText}>
                        <span
                          className={`${styles.filterName} ${
                            isChecked ? styles.filterNameActive : ''
                          }`}
                        >
                          {item.label}
                        </span>
                        <span className={styles.count}>({count})</span>
                      </span>
                    </label>
                  );
                })}
              </div>

              {styleItems.length > VISIBLE_COUNT && (
                <button
                  type="button"
                  className={styles.showMoreButton}
                  onClick={() => setShowAllStyles((prev) => !prev)}
                >
                  {showAllStyles ? 'Згорнути' : 'Показати ще'}
                  <span
                    className={`${styles.showMoreArrow} ${
                      showAllStyles ? styles.showMoreArrowUp : ''
                    }`}
                  >
                    ⌄
                  </span>
                </button>
              )}
            </div>
          </aside>

          <section className={styles.products}>
            {isLoading ? (
              <p>Завантаження товарів...</p>
            ) : errorText ? (
              <p>{errorText}</p>
            ) : filteredProducts.length === 0 ? (
              <p>За вибраними фільтрами товарів не знайдено.</p>
            ) : (
              <div className={styles.grid}>
                {filteredProducts.map((product) => (
                  <CatalogCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    image={product.image}
                    isHit={product.isHit}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}