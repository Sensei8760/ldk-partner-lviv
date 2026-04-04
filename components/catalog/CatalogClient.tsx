'use client';

import { useMemo, useState } from 'react';
import CatalogCard from '@/components/catalogCard/CatalogCard';
import styles from '@/app/catalog/CatalogPage.module.css';
import type { Product } from '@/lib/products';

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
const MIN_GAP = 0;
const PRODUCTS_STEP = 9;

function normalizeValue(value: string) {
  return value.trim().toLowerCase();
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function CatalogClient({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const products = initialProducts;

  const priceBounds = useMemo(() => {
    if (products.length === 0) {
      return { min: 0, max: 0 };
    }

    const prices = products
      .map((product) => Number(product.price))
      .filter((price) => Number.isFinite(price));

    if (prices.length === 0) {
      return { min: 0, max: 0 };
    }

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [products]);

  const [showAllStyles, setShowAllStyles] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [priceFrom, setPriceFrom] = useState(priceBounds.min);
  const [priceTo, setPriceTo] = useState(priceBounds.max);
  const [priceFromInput, setPriceFromInput] = useState(String(priceBounds.min));
  const [priceToInput, setPriceToInput] = useState(String(priceBounds.max));
  const [visibleProductsCount, setVisibleProductsCount] = useState(PRODUCTS_STEP);

  const visibleStyles = showAllStyles ? styleItems : styleItems.slice(0, VISIBLE_COUNT);

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
    const result = products.filter((product) => {
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

      const matchesPrice = product.price >= priceFrom && product.price <= priceTo;

      return matchesType && matchesStyle && matchesPrice;
    });

    return [...result].sort((a, b) => {
      const aOut = a.stock <= 0 ? 1 : 0;
      const bOut = b.stock <= 0 ? 1 : 0;

      if (aOut !== bOut) {
        return aOut - bOut;
      }

      return 0;
    });
  }, [products, selectedTypes, selectedStyles, priceFrom, priceTo]);

  const visibleProducts = filteredProducts.slice(0, visibleProductsCount);
  const hasMoreProducts = visibleProductsCount < filteredProducts.length;
  const hasProducts = products.length > 0;

  const resetVisibleCount = () => {
    setVisibleProductsCount(PRODUCTS_STEP);
  };

  const handleToggleType = (id: string) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    resetVisibleCount();
  };

  const handleToggleStyle = (id: string) => {
    setSelectedStyles((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    resetVisibleCount();
  };

  const handlePriceFromSlider = (value: number) => {
    const nextFrom = clamp(value, priceBounds.min, priceTo - MIN_GAP);
    setPriceFrom(nextFrom);
    setPriceFromInput(String(nextFrom));
    resetVisibleCount();
  };

  const handlePriceToSlider = (value: number) => {
    const nextTo = clamp(value, priceFrom + MIN_GAP, priceBounds.max);
    setPriceTo(nextTo);
    setPriceToInput(String(nextTo));
    resetVisibleCount();
  };

  const handlePriceFromInputChange = (value: string) => {
    setPriceFromInput(value.replace(/[^\d]/g, ''));
  };

  const handlePriceToInputChange = (value: string) => {
    setPriceToInput(value.replace(/[^\d]/g, ''));
  };

  const applyPriceFromInput = () => {
    if (priceFromInput === '') {
      setPriceFrom(priceBounds.min);
      setPriceFromInput(String(priceBounds.min));
      resetVisibleCount();
      return;
    }

    const numericValue = Number(priceFromInput);
    const nextFrom = clamp(numericValue, priceBounds.min, priceTo - MIN_GAP);

    setPriceFrom(nextFrom);
    setPriceFromInput(String(nextFrom));
    resetVisibleCount();
  };

  const applyPriceToInput = () => {
    if (priceToInput === '') {
      setPriceTo(priceBounds.max);
      setPriceToInput(String(priceBounds.max));
      resetVisibleCount();
      return;
    }

    const numericValue = Number(priceToInput);
    const nextTo = clamp(numericValue, priceFrom + MIN_GAP, priceBounds.max);

    setPriceTo(nextTo);
    setPriceToInput(String(nextTo));
    resetVisibleCount();
  };

  const handleShowMoreProducts = () => {
    setVisibleProductsCount((prev) => prev + PRODUCTS_STEP);
  };

  const sliderRangePercent =
    priceBounds.max > priceBounds.min
      ? ((priceTo - priceFrom) / (priceBounds.max - priceBounds.min)) * 100
      : 0;

  const sliderLeftPercent =
    priceBounds.max > priceBounds.min
      ? ((priceFrom - priceBounds.min) / (priceBounds.max - priceBounds.min)) * 100
      : 0;

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Фільтри</h2>

        <div className={styles.filterGroup}>
          <h3 className={styles.groupTitle}>Тип</h3>

          <div className={styles.filtersList}>
            {typeItems.map((item) => {
              const isChecked = selectedTypes.includes(item.id);
              const count = item.id === 'street' ? typeCounts.street : typeCounts.apartment;

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
          <h3 className={styles.groupTitle}>Ціна, грн</h3>

          <div className={styles.priceInputs}>
            <input
              type="text"
              inputMode="numeric"
              value={priceFromInput}
              onChange={(e) => handlePriceFromInputChange(e.target.value)}
              onBlur={applyPriceFromInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  applyPriceFromInput();
                }
              }}
              className={styles.priceInput}
              placeholder="Від"
              disabled={!hasProducts}
            />

            <span className={styles.priceDivider}>-</span>

            <input
              type="text"
              inputMode="numeric"
              value={priceToInput}
              onChange={(e) => handlePriceToInputChange(e.target.value)}
              onBlur={applyPriceToInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  applyPriceToInput();
                }
              }}
              className={styles.priceInput}
              placeholder="До"
              disabled={!hasProducts}
            />
          </div>

          <div className={styles.rangeWrapper}>
            <div className={styles.rangeTrack}></div>
            <div
              className={styles.rangeProgress}
              style={{
                left: `${sliderLeftPercent}%`,
                width: `${sliderRangePercent}%`,
              }}
            ></div>

            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              value={priceFrom}
              onChange={(e) => handlePriceFromSlider(Number(e.target.value))}
              className={`${styles.rangeInput} ${styles.rangeInputMin}`}
              disabled={!hasProducts}
            />

            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              value={priceTo}
              onChange={(e) => handlePriceToSlider(Number(e.target.value))}
              className={`${styles.rangeInput} ${styles.rangeInputMax}`}
              disabled={!hasProducts}
            />
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
        {filteredProducts.length === 0 ? (
          <div className={styles.stateBox}>
            <h2 className={styles.stateTitle}>Товарів не знайдено</h2>
            <p className={styles.stateText}>
              За вибраними фільтрами немає відповідних дверей. Спробуйте змінити
              параметри пошуку.
            </p>
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {visibleProducts.map((product) => (
                <CatalogCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  price={product.price}
                  image={product.image}
                  stock={product.stock}
                  isHit={product.isHit}
                />
              ))}
            </div>

            {hasMoreProducts ? (
              <div className={styles.showMoreWrap}>
                <button
                  type="button"
                  className={styles.showMoreProductsButton}
                  onClick={handleShowMoreProducts}
                >
                  Показати ще
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}