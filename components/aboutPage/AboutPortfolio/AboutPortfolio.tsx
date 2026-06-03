'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './AboutPortfolio.module.css';

const portfolioImages = Array.from({ length: 11 }, (_, index) => ({
  src: `/images/Portfolio/portfolio-${index + 1}.jpg`,
  alt: `Реалізований проєкт Portala ${index + 1}`,
}));

export default function AboutPortfolio() {
  const middleStartIndex = portfolioImages.length;

  const [visibleCount, setVisibleCount] = useState(4);
  const [currentIndex, setCurrentIndex] = useState(middleStartIndex);
  const [withTransition, setWithTransition] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const isAnimatingRef = useRef(false);

  const loopImages = useMemo(() => {
    return [...portfolioImages, ...portfolioImages, ...portfolioImages];
  }, []);

  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth <= 560) {
        setVisibleCount(1.55);
      } else if (window.innerWidth <= 768) {
        setVisibleCount(2);
      } else if (window.innerWidth <= 1000) {
        setVisibleCount(3);
      } else {
        setVisibleCount(4);
      }
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);

    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  const slideWidth = 100 / visibleCount;

  const goNext = () => {
    if (isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    setWithTransition(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const goPrev = () => {
    if (isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    setWithTransition(true);
    setCurrentIndex((prev) => prev - 1);
  };

  const handleTransitionEnd = () => {
    isAnimatingRef.current = false;

    // Якщо дійшли до третього дубля — непомітно повертаємося
    // на такий самий слайд у середньому дублі.
    if (currentIndex >= portfolioImages.length * 2) {
      setWithTransition(false);
      setCurrentIndex((prev) => prev - portfolioImages.length);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setWithTransition(true);
        });
      });

      return;
    }

    // Якщо пішли назад до першого дубля — непомітно повертаємося
    // на такий самий слайд у середньому дублі.
    if (currentIndex < portfolioImages.length) {
      setWithTransition(false);
      setCurrentIndex((prev) => prev + portfolioImages.length);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setWithTransition(true);
        });
      });
    }
  };

  useEffect(() => {
    if (isHovered) return;

    const timer = setInterval(() => {
      goNext();
    }, 3000);

    return () => clearInterval(timer);
  }, [isHovered]);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.label}>Наші роботи</p>
          <h2 className={styles.title}>Реалізовані проєкти</h2>
        </div>

        <div className={styles.slider}>
          <div
            className={styles.viewport}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div
              className={styles.track}
              onTransitionEnd={handleTransitionEnd}
              style={{
                transform: `translateX(-${currentIndex * slideWidth}%)`,
                transition: withTransition ? 'transform 0.7s ease' : 'none',
              }}
            >
              {loopImages.map((image, index) => (
                <div
                  className={styles.slide}
                  style={{ flexBasis: `${slideWidth}%` }}
                  key={`${image.src}-${index}`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={280}
                    height={381}
                    className={styles.image}
                    priority={index < portfolioImages.length + 4}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.arrows}>
            <button
              type="button"
              className={`${styles.arrow} ${styles.arrowLeft}`}
              onClick={goPrev}
              aria-label="Попереднє фото"
            >
              <svg className={styles.arrowIcon} aria-hidden="true">
                <use href="/icons/symbol-defs.svg?v=6#arrow_back_ios_new" />
              </svg>
            </button>

            <button
              type="button"
              className={`${styles.arrow} ${styles.arrowRight}`}
              onClick={goNext}
              aria-label="Наступне фото"
            >
              <svg className={styles.arrowIcon} aria-hidden="true">
                <use href="/icons/symbol-defs.svg?v=6#arrow_back_ios_new" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}