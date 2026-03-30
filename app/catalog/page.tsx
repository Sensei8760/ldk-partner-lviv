'use client';

import { useState } from 'react';
import CatalogCard from '@/components/catalogCard/CatalogCard';
import styles from './CatalogPage.module.css';

const typeItems = [
  { id: 'street', label: 'Вулиця', count: 128 },
  { id: 'apartment', label: 'Квартира', count: 264 },
];

const styleItems = [
  { id: 'portala', label: 'ПОРТАЛА', count: 40387 },
  { id: 'dpm-mk', label: 'ДПМ+МК', count: 2765 },
  { id: 'komfort-new', label: 'Комфорт NEW', count: 7923 },
  { id: 'elegant-new', label: 'Елегант NEW', count: 84871 },
  { id: 'koncept', label: 'Концепт', count: 65243 },
  { id: 'modern', label: 'Модерн', count: 18976 },
  { id: 'lux', label: 'ЛЮКС', count: 225 },
  { id: 'trio-light', label: 'ТРІО ЛАЙТ', count: 755 },
  { id: 'trio', label: 'ТРІО', count: 226 },
  { id: 'trio-termo', label: 'ТРІО ТЕРМО', count: 1402 },
  { id: 'trio-mottura', label: 'ТРІО MOTTURA', count: 511 },
  { id: 'kvadro', label: 'Квадро', count: 921 },
  { id: 'strit', label: 'Стріт', count: 1320 },
  { id: 'strit-termo', label: 'Стріт ТЕРМО', count: 645 },
  { id: 'prof-guard', label: 'PROF GUARD', count: 488 },
  { id: 'fire-econom-epik', label: 'Протипожежні + Економ + Епік', count: 907 },
  { id: 'sale', label: 'РОЗПРОДАЖ', count: 177 },
  { id: 'sale-premium-new', label: 'РОЗПРОДАЖ Преміум NEW', count: 93 },
];

const products = [
  {
    id: 'door-1',
    title: 'Міжкімнатні двері "Doors" Smart - модель - C067',
    price: 3064,
    image: '/images/doors/door-1.jpg',
    isHit: true,
  },
  {
    id: 'door-2',
    title: 'Міжкімнатні двері "Doors" Smart - модель - C068',
    price: 3250,
    image: '/images/doors/door-1.jpg',
    isHit: false,
  },
  {
    id: 'door-3',
    title: 'Міжкімнатні двері "Doors" Smart - модель - C069',
    price: 3390,
    image: '/images/doors/door-1.jpg',
    isHit: true,
  },
  {
    id: 'door-4',
    title: 'Міжкімнатні двері "Doors" Smart - модель - C070',
    price: 2980,
    image: '/images/doors/door-1.jpg',
    isHit: false,
  },
  {
    id: 'door-5',
    title: 'Міжкімнатні двері "Doors" Smart - модель - C071',
    price: 3150,
    image: '/images/doors/door-1.jpg',
    isHit: false,
  },
  {
    id: 'door-6',
    title: 'Міжкімнатні двері "Doors" Smart - модель - C072',
    price: 3420,
    image: '/images/doors/door-1.jpg',
    isHit: true,
  },
];

const VISIBLE_COUNT = 5;

export default function CatalogPage() {
  const [showAllStyles, setShowAllStyles] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  const visibleStyles = showAllStyles
    ? styleItems
    : styleItems.slice(0, VISIBLE_COUNT);

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
                        <span className={styles.count}>({item.count})</span>
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
                        <span className={styles.count}>({item.count})</span>
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
            <div className={styles.grid}>
              {products.map((product) => (
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
          </section>
        </div>
      </div>
    </main>
  );
}