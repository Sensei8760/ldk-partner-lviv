"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import styles from "./AboutPortfolio.module.css";

const portfolioImages = Array.from({ length: 11 }, (_, index) => ({
  src: `/images/Portfolio/portfolio-${index + 1}.jpg`,
  alt: `Реалізований проєкт Portala ${index + 1}`,
}));

type SliderMode = "idle" | "next" | "prevStart" | "prev";

export default function AboutPortfolio() {
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const [mode, setMode] = useState<SliderMode>("idle");
  const [isHovered, setIsHovered] = useState(false);

  const shift = 100 / visibleCount;

  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth <= 480) {
        setVisibleCount(1);
      } else if (window.innerWidth <= 768) {
        setVisibleCount(2);
      } else if (window.innerWidth <= 1000) {
        setVisibleCount(3);
      } else {
        setVisibleCount(4);
      }
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);

    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  const getImageByIndex = (index: number) => {
    const normalizedIndex =
      ((index % portfolioImages.length) + portfolioImages.length) %
      portfolioImages.length;

    return portfolioImages[normalizedIndex];
  };

  const visibleImages = useMemo(() => {
    if (mode === "prevStart" || mode === "prev") {
      return Array.from({ length: visibleCount + 1 }, (_, index) =>
        getImageByIndex(startIndex - 1 + index)
      );
    }

    return Array.from({ length: visibleCount + 1 }, (_, index) =>
      getImageByIndex(startIndex + index)
    );
  }, [startIndex, visibleCount, mode]);

  const goNext = () => {
    if (mode !== "idle") return;
    setMode("next");
  };

  const goPrev = () => {
    if (mode !== "idle") return;

    setMode("prevStart");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setMode("prev");
      });
    });
  };

  const handleTransitionEnd = () => {
    if (mode === "next") {
      setStartIndex((current) => (current + 1) % portfolioImages.length);
      setMode("idle");
    }

    if (mode === "prev") {
      setStartIndex(
        (current) =>
          (current - 1 + portfolioImages.length) % portfolioImages.length
      );
      setMode("idle");
    }
  };

useEffect(() => {
  if (isHovered || mode !== "idle") return;

  const timer = setInterval(() => {
    setMode("next");
  }, 3000);

  return () => clearInterval(timer);
}, [isHovered, mode]);

  const getTransform = () => {
    if (mode === "next") return `translateX(-${shift}%)`;
    if (mode === "prevStart") return `translateX(-${shift}%)`;
    if (mode === "prev") return "translateX(0)";
    return "translateX(0)";
  };

  const hasTransition = mode === "next" || mode === "prev";

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <p className={styles.label}>Наші роботи</p>
        <h2 className={styles.title}>Реалізовані проєкти</h2>

        <div className={styles.slider}>
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowLeft}`}
            onClick={goPrev}
            aria-label="Попереднє фото"
          >
            <svg className={styles.arrowIcon}>
              <use href="/icons/symbol-defs.svg#arrow_back_ios_new" />
            </svg>
          </button>

          <div
            className={styles.viewport}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div
              className={styles.track}
              onTransitionEnd={handleTransitionEnd}
              style={{
                transform: getTransform(),
                transition: hasTransition ? "transform 0.7s ease" : "none",
              }}
            >
              {visibleImages.map((image, index) => (
                <div
                  className={styles.slide}
                  style={{ flexBasis: `${100 / visibleCount}%` }}
                  key={`${image.src}-${index}-${mode}`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={280}
                    height={380}
                    className={styles.image}
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowRight}`}
            onClick={goNext}
            aria-label="Наступне фото"
          >
            <svg className={styles.arrowIcon}>
              <use href="/icons/symbol-defs.svg#arrow_back_ios_new" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}