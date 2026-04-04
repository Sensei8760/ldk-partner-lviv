'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import styles from './ProductPage.module.css';

type ProductGalleryProps = {
  title: string;
  images: string[];
};

export default function ProductGallery({ title, images }: ProductGalleryProps) {
  const safeImages = useMemo(
    () => (images.length > 0 ? images : ['/images/doors/door-1.jpg']),
    [images]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const normalizedIndex =
    safeImages.length > 0 ? currentIndex % safeImages.length : 0;

  const currentImage = safeImages[normalizedIndex] || safeImages[0];
  const hasMultipleImages = safeImages.length > 1;

  const showPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  }, [safeImages.length]);

  const showNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
  }, [safeImages.length]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isZoomOpen) return;

      if (event.key === 'Escape') {
        setIsZoomOpen(false);
      }

      if (event.key === 'ArrowLeft') {
        showPrev();
      }

      if (event.key === 'ArrowRight') {
        showNext();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomOpen, showPrev, showNext]);

  return (
    <>
      <div className={styles.gallery}>
        <div
          className={styles.imageWrapper}
          onClick={() => setIsZoomOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsZoomOpen(true);
            }
          }}
          aria-label="Збільшити фото товару"
        >
          <Image
            src={currentImage}
            alt={title}
            fill
            className={styles.image}
            priority
          />

          {hasMultipleImages ? (
            <>
              <button
                type="button"
                className={`${styles.galleryArrowOverlay} ${styles.galleryArrowOverlayLeft}`}
                onClick={(e) => {
                  e.stopPropagation();
                  showPrev();
                }}
                aria-label="Попереднє фото"
              >
                ←
              </button>

              <button
                type="button"
                className={`${styles.galleryArrowOverlay} ${styles.galleryArrowOverlayRight}`}
                onClick={(e) => {
                  e.stopPropagation();
                  showNext();
                }}
                aria-label="Наступне фото"
              >
                →
              </button>
            </>
          ) : null}
        </div>
      </div>

      {isZoomOpen ? (
        <div
          className={styles.zoomOverlay}
          onClick={() => setIsZoomOpen(false)}
          role="presentation"
        >
          <div
            className={styles.zoomContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.zoomClose}
              onClick={() => setIsZoomOpen(false)}
              aria-label="Закрити перегляд"
            >
              ✕
            </button>

            {hasMultipleImages ? (
              <button
                type="button"
                className={`${styles.zoomArrow} ${styles.zoomArrowLeft}`}
                onClick={showPrev}
                aria-label="Попереднє фото"
              >
                ←
              </button>
            ) : null}

            <div className={styles.zoomImageWrapper}>
              <Image
                src={currentImage}
                alt={title}
                fill
                className={styles.zoomImage}
                sizes="100vw"
              />
            </div>

            {hasMultipleImages ? (
              <button
                type="button"
                className={`${styles.zoomArrow} ${styles.zoomArrowRight}`}
                onClick={showNext}
                aria-label="Наступне фото"
              >
                →
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}