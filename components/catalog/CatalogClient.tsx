'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import CatalogCard from '@/components/catalogCard/CatalogCard';
import styles from '@/app/catalog/CatalogPage.module.css';
import type { Product, ProductSize } from '@/lib/products';
import { getFavoriteIds } from '@/store/favorites';

const productTypeItems = [
  { id: 'interior', label: 'Міжкімнатні' },
  { id: 'entrance', label: 'Вхідні' },
] as const;

const installPlaceItems = [
  { id: 'street', label: 'Вулиця' },
  { id: 'apartment', label: 'Квартира' },
] as const;

const styleItems = [
  { id: 'portala', label: 'ПОРТАЛА' },
  { id: 'dpm-mk', label: 'ДПМ+МК' },
  { id: 'komfort-new', label: 'Комфорт NEW' },
  { id: 'elegant-new', label: 'Елегант NEW' },
  { id: 'koncept', label: 'Концепт' },
  { id: 'modern', label: 'Модерн' },
  { id: 'lux', label: 'Люкс' },
  { id: 'trio-light', label: 'Тріо ЛАЙТ' },
  { id: 'trio', label: 'Тріо' },
  { id: 'trio-termo', label: 'Тріо ТЕРМО' },
  { id: 'trio-mottura', label: 'Тріо MOTTURA' },
  { id: 'kvadro', label: 'Квадро' },
  { id: 'strit', label: 'Стріт' },
  { id: 'strit-termo', label: 'Стріт ТЕРМО' },
  { id: 'prof-guard', label: 'PROF GUARD' },
  { id: 'fire-econom-epik', label: 'Протипожежні + Економ + Епік' },
  { id: 'sale', label: 'РОЗПРОДАЖ' },
  { id: 'sale-premium-new', label: 'РОЗПРОДАЖ Преміум NEW' },
] as const;

const openingItems = [
  { id: 'left', label: 'Ліве' },
  { id: 'right', label: 'Праве' },
] as const;

const sizeItems = [
  { id: '850x2040', label: '850х2040 мм' },
  { id: '950x2040', label: '950х2040 мм' },
  { id: '1200x2040', label: '1200х2040 мм' },
] as const;

const STYLE_VISIBLE_COUNT = 2;
const PRODUCTS_STEP = 6;
const MIN_GAP = 0;

type SortValue = 'price-asc' | 'price-desc';
type ProductTypeValue = (typeof productTypeItems)[number]['id'];
type InstallPlaceValue = (typeof installPlaceItems)[number]['id'];
type OpeningValue = (typeof openingItems)[number]['id'];
type SizeValue = (typeof sizeItems)[number]['id'];

const sortOptions: { value: SortValue; label: string }[] = [
  { value: 'price-asc', label: 'Від дешевих до дорогих' },
  { value: 'price-desc', label: 'Від дорогих до дешевих' },
];

function normalizeValue(value: string) {
  return value.trim().toLowerCase();
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getProductType(product: Product): ProductTypeValue {
  return product.doorType === 'entrance' ? 'entrance' : 'interior';
}

function getInstallPlace(product: Product): InstallPlaceValue {
  return product.type === 'street' ? 'street' : 'apartment';
}

function getSizeSideStocks(item: Product['sizeStocks'][number]) {
  const leftStock = Math.max(0, Number(item.leftStock) || 0);
  const rightStock = Math.max(0, Number(item.rightStock) || 0);
  const fallbackStock = Math.max(0, Number(item.stock) || 0);

  if (leftStock > 0 || rightStock > 0) {
    return {
      leftStock,
      rightStock,
      totalStock: leftStock + rightStock,
    };
  }

  return {
    leftStock: 0,
    rightStock: fallbackStock,
    totalStock: fallbackStock,
  };
}

function getOpenings(product: Product): OpeningValue[] {
  if (Array.isArray(product.sizeStocks) && product.sizeStocks.length > 0) {
    const hasLeft = product.sizeStocks.some(
      (item) => getSizeSideStocks(item).leftStock > 0
    );
    const hasRight = product.sizeStocks.some(
      (item) => getSizeSideStocks(item).rightStock > 0
    );

    const openings: OpeningValue[] = [];

    if (hasLeft) openings.push('left');
    if (hasRight) openings.push('right');

    if (openings.length > 0) {
      return openings;
    }
  }

  if (!Array.isArray(product.openings)) return [];

  return product.openings.filter(
    (item): item is OpeningValue => item === 'left' || item === 'right'
  );
}

function getSizes(product: Product): SizeValue[] {
  if (Array.isArray(product.sizeStocks) && product.sizeStocks.length > 0) {
    return product.sizeStocks
      .map((item) => item.size)
      .filter(
        (item): item is SizeValue =>
          item === '850x2040' || item === '950x2040' || item === '1200x2040'
      );
  }

  if (!Array.isArray(product.sizes)) return [];

  return product.sizes.filter(
    (item): item is SizeValue =>
      item === '850x2040' || item === '950x2040' || item === '1200x2040'
  );
}

function getTotalStock(product: Product) {
  if (Array.isArray(product.sizeStocks) && product.sizeStocks.length > 0) {
    return product.sizeStocks.reduce(
      (sum, item) => sum + getSizeSideStocks(item).totalStock,
      0
    );
  }

  return Number.isFinite(product.stock) ? Math.max(0, product.stock) : 0;
}

function hasSize(product: Product, size: ProductSize) {
  if (Array.isArray(product.sizeStocks) && product.sizeStocks.length > 0) {
    return product.sizeStocks.some((item) => item.size === size);
  }

  return Array.isArray(product.sizes) ? product.sizes.includes(size) : false;
}

function getDisplayPrice(product: Product) {
  return product.discountPrice !== null &&
    product.discountPrice !== undefined &&
    product.discountPrice > 0 &&
    product.discountPrice < product.price
    ? product.discountPrice
    : product.price;
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
      .map((product) => Number(getDisplayPrice(product)))
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
  const [selectedProductTypes, setSelectedProductTypes] = useState<ProductTypeValue[]>([]);
  const [selectedInstallPlaces, setSelectedInstallPlaces] = useState<InstallPlaceValue[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedOpenings, setSelectedOpenings] = useState<OpeningValue[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<SizeValue[]>([]);
  const [priceFrom, setPriceFrom] = useState(priceBounds.min);
  const [priceTo, setPriceTo] = useState(priceBounds.max);
  const [priceFromInput, setPriceFromInput] = useState(String(priceBounds.min));
  const [priceToInput, setPriceToInput] = useState(String(priceBounds.max));
  const [visibleProductsCount, setVisibleProductsCount] = useState(PRODUCTS_STEP);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortValue>('price-asc');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const sortDropdownRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSortOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const resetVisibleCount = () => {
    setVisibleProductsCount(PRODUCTS_STEP);
  };

  const resetAllFilters = () => {
  setSelectedProductTypes([]);
  setSelectedInstallPlaces([]);
  setSelectedStyles([]);
  setSelectedOpenings([]);
  setSelectedSizes([]);

  setPriceFrom(priceBounds.min);
  setPriceTo(priceBounds.max);
  setPriceFromInput(String(priceBounds.min));
  setPriceToInput(String(priceBounds.max));

  setSearchQuery('');
  setShowOnlyFavorites(false);
  setShowAllStyles(false);
  setSortBy('price-asc');

  resetVisibleCount();
};

  const handleSortSelect = (value: SortValue) => {
    setSortBy(value);
    setIsSortOpen(false);
    resetVisibleCount();
  };

  const visibleStyles = showAllStyles
    ? styleItems
    : styleItems.slice(0, STYLE_VISIBLE_COUNT);

  const selectedSortOption =
    sortOptions.find((option) => option.value === sortBy) ?? sortOptions[0];

  const productTypeCounts = useMemo(() => {
    return {
      interior: products.filter((product) => getProductType(product) === 'interior').length,
      entrance: products.filter((product) => getProductType(product) === 'entrance').length,
    };
  }, [products]);

  const installPlaceCounts = useMemo(() => {
    return {
      street: products.filter((product) => getInstallPlace(product) === 'street').length,
      apartment: products.filter((product) => getInstallPlace(product) === 'apartment').length,
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

  const openingCounts = useMemo(() => {
    return {
      left: products.filter((product) => getOpenings(product).includes('left')).length,
      right: products.filter((product) => getOpenings(product).includes('right')).length,
    };
  }, [products]);

  const sizeCounts = useMemo(() => {
    return {
      '850x2040': products.filter((product) => hasSize(product, '850x2040')).length,
      '950x2040': products.filter((product) => hasSize(product, '950x2040')).length,
      '1200x2040': products.filter((product) => hasSize(product, '1200x2040')).length,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    const result = products.filter((product) => {
      const productType = getProductType(product);
      const installPlace = getInstallPlace(product);
      const openings = getOpenings(product);
      const sizes = getSizes(product);
      const currentPrice = getDisplayPrice(product);

      const matchesProductType =
        selectedProductTypes.length === 0 ||
        selectedProductTypes.includes(productType);

      const matchesInstallPlace =
        selectedInstallPlaces.length === 0 ||
        selectedInstallPlaces.includes(installPlace);

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

      const matchesOpening =
        selectedOpenings.length === 0 ||
        selectedOpenings.some((opening) => openings.includes(opening));

      const matchesSize =
        selectedSizes.length === 0 ||
        selectedSizes.some((size) => sizes.includes(size));

      const matchesPrice = currentPrice >= priceFrom && currentPrice <= priceTo;

      const matchesSearch =
        normalizedSearch.length === 0 ||
        product.title.toLowerCase().includes(normalizedSearch);

      const matchesFavorites =
        !showOnlyFavorites || favoriteIds.includes(product.id);

      return (
        matchesProductType &&
        matchesInstallPlace &&
        matchesStyle &&
        matchesOpening &&
        matchesSize &&
        matchesPrice &&
        matchesSearch &&
        matchesFavorites
      );
    });

    return [...result].sort((a, b) => {
      const aOutOfStock = getTotalStock(a) <= 0 ? 1 : 0;
      const bOutOfStock = getTotalStock(b) <= 0 ? 1 : 0;

      if (aOutOfStock !== bOutOfStock) {
        return aOutOfStock - bOutOfStock;
      }

      if (sortBy === 'price-desc') {
        return getDisplayPrice(b) - getDisplayPrice(a);
      }

      return getDisplayPrice(a) - getDisplayPrice(b);
    });
  }, [
    products,
    selectedProductTypes,
    selectedInstallPlaces,
    selectedStyles,
    selectedOpenings,
    selectedSizes,
    priceFrom,
    priceTo,
    searchQuery,
    showOnlyFavorites,
    favoriteIds,
    sortBy,
  ]);

  const visibleProducts = filteredProducts.slice(0, visibleProductsCount);
  const hasMoreProducts = visibleProductsCount < filteredProducts.length;
  const hasProducts = products.length > 0;

const hasActiveFilters =
  selectedProductTypes.length > 0 ||
  selectedInstallPlaces.length > 0 ||
  selectedStyles.length > 0 ||
  selectedOpenings.length > 0 ||
  selectedSizes.length > 0 ||
  priceFrom !== priceBounds.min ||
  priceTo !== priceBounds.max ||
  searchQuery.trim().length > 0 ||
  showOnlyFavorites;

  const handleToggleProductType = (id: ProductTypeValue) => {
    setSelectedProductTypes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    resetVisibleCount();
  };

  const handleToggleInstallPlace = (id: InstallPlaceValue) => {
    setSelectedInstallPlaces((prev) =>
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

  const handleToggleOpening = (id: OpeningValue) => {
    setSelectedOpenings((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    resetVisibleCount();
  };

  const handleToggleSize = (id: SizeValue) => {
    setSelectedSizes((prev) =>
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

  const sliderLeftPercent =
    priceBounds.max > priceBounds.min
      ? ((priceFrom - priceBounds.min) / (priceBounds.max - priceBounds.min)) * 100
      : 0;

  const sliderRangePercent =
    priceBounds.max > priceBounds.min
      ? ((priceTo - priceFrom) / (priceBounds.max - priceBounds.min)) * 100
      : 0;

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Фільтри</h2>

        <div className={styles.filterGroup}>
          <h3 className={styles.groupTitle}>Тип</h3>

          <div className={styles.filtersList}>
            {productTypeItems.map((item) => {
              const isChecked = selectedProductTypes.includes(item.id);
              const count =
                item.id === 'interior'
                  ? productTypeCounts.interior
                  : productTypeCounts.entrance;

              return (
                <label key={item.id} className={styles.filterLabel}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleProductType(item.id)}
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
          <h3 className={styles.groupTitle}>Місце встановлення</h3>

          <div className={styles.filtersList}>
            {installPlaceItems.map((item) => {
              const isChecked = selectedInstallPlaces.includes(item.id);
              const count =
                item.id === 'street'
                  ? installPlaceCounts.street
                  : installPlaceCounts.apartment;

              return (
                <label key={item.id} className={styles.filterLabel}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleInstallPlace(item.id)}
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

            <span className={styles.priceDivider}>—</span>

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

          {styleItems.length > STYLE_VISIBLE_COUNT ? (
            <button
              type="button"
              className={styles.showMoreButton}
              onClick={() => setShowAllStyles((prev) => !prev)}
            >
              {showAllStyles ? 'Згорнути' : 'Показати ще'}

              <span
                className={`${styles.showMoreIcon} ${
                  showAllStyles ? styles.showMoreIconUp : ''
                }`}
                aria-hidden="true"
              >
                <svg className={styles.showMoreIconSvg}>
                  <use href="/icons/symbol-defs.svg?v=6#icon-fi-rs-angle-small-up" />
                </svg>
              </span>
            </button>
          ) : null}
        </div>

        <div className={styles.filterGroup}>
          <h3 className={styles.groupTitle}>Відкривання дверей</h3>

          <div className={styles.filtersList}>
            {openingItems.map((item) => {
              const isChecked = selectedOpenings.includes(item.id);
              const count =
                item.id === 'left' ? openingCounts.left : openingCounts.right;

              return (
                <label key={item.id} className={styles.filterLabel}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleOpening(item.id)}
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
          <h3 className={styles.groupTitle}>Розмір</h3>

          <div className={styles.filtersList}>
            {sizeItems.map((item) => {
              const isChecked = selectedSizes.includes(item.id);
              const count = sizeCounts[item.id] || 0;

              return (
                <label key={item.id} className={styles.filterLabel}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleSize(item.id)}
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
      </aside>

      <section className={styles.products}>
        <div className={styles.topBar}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon} aria-hidden="true">
              <svg className={styles.searchIconSvg}>
                <use href="/icons/symbol-defs.svg?v=6#icon-fi-rs-search" />
              </svg>
            </span>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                resetVisibleCount();
              }}
              className={styles.searchInput}
              placeholder="Пошук"
              aria-label="Пошук дверей по назві"
            />
          </div>

          <div className={styles.topBarActions}>
            <div className={styles.sortSelectWrap} ref={sortDropdownRef}>
              <button
                type="button"
                className={`${styles.sortSelect} ${
                  isSortOpen ? styles.sortSelectOpen : ''
                }`}
                onClick={() => setIsSortOpen((prev) => !prev)}
                aria-label="Сортування товарів"
                aria-expanded={isSortOpen}
              >
                <span>{selectedSortOption.label}</span>

                <span className={styles.sortSelectIcon} aria-hidden="true">
                  <svg className={styles.sortSelectIconSvg}>
                    <use href="/icons/symbol-defs.svg?v=6#icon-fi-rs-angle-small-up" />
                  </svg>
                </span>
              </button>

              {isSortOpen ? (
                <div className={styles.sortMenu}>
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`${styles.sortOption} ${
                        option.value === sortBy ? styles.sortOptionActive : ''
                      }`}
                      onClick={() => handleSortSelect(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <button
  type="button"
  className={`${styles.favoriteFilterButton} ${
    showOnlyFavorites ? styles.favoriteFilterButtonActive : ''
  }`}
  onClick={() => {
    setShowOnlyFavorites((prev) => !prev);
    resetVisibleCount();
  }}
  aria-label="Показати збережені двері"
  title="Показати збережені двері"
>
  <span className={styles.favoriteFilterLabel}>
    Збережені ({favoriteIds.length})
  </span>

  <span className={styles.favoriteFilterIcon} aria-hidden="true">
    <svg className={styles.favoriteFilterIconSvg}>
      <use href="/icons/symbol-defs.svg?v=6#icon-fi-rr-star" />
    </svg>
  </span>
</button>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
  <div className={styles.stateBox}>
    <h2 className={styles.stateTitle}>Нічого не знайдено</h2>

    <p className={styles.stateText}>
      Спробуйте змінити параметри пошуку або скинути фільтри.
    </p>

    {hasActiveFilters ? (
      <button
        type="button"
        className={styles.resetFiltersButton}
        onClick={resetAllFilters}
      >
        Скинути фільтри
      </button>
    ) : null}
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
                  discountPrice={product.discountPrice}
                  image={product.image}
                  images={product.images}
                  stock={getTotalStock(product)}
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
                  <span className={styles.showMoreProductsArrow} aria-hidden="true">
                    <svg className={styles.showMoreProductsArrowSvg}>
                      <use href="/icons/symbol-defs.svg?v=6#icon-fi-rs-arrow-right" />
                    </svg>
                  </span>
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}