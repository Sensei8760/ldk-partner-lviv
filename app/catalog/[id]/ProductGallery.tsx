'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import styles from './ProductPage.module.css';
import {
  FALLBACK_PRODUCT_IMAGE,
  getSafeProductImages,
} from '@/utils/productImages';

type ProductGalleryProps = {
  title: string;
  images: string[];
};

export default function ProductGallery({ title, images }: ProductGalleryProps) {
  const safeImages = useMemo(() => getSafeProductImages(images), [images]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const resolvedImages = safeImages.map((src) =>
    brokenImages[src] ? FALLBACK_PRODUCT_IMAGE : src
  );

  const normalizedIndex =
    resolvedImages.length > 0
      ? ((currentIndex % resolvedImages.length) + resolvedImages.length) %
        resolvedImages.length
      : 0;

  const currentImage = resolvedImages[normalizedIndex] || FALLBACK_PRODUCT_IMAGE;
  const hasMultipleImages = resolvedImages.length > 1;

  const showPrev = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? resolvedImages.length - 1 : prev - 1
    );
  }, [resolvedImages.length]);

  const showNext = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === resolvedImages.length - 1 ? 0 : prev + 1
    );
  }, [resolvedImages.length]);

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

  useEffect(() => {
    if (resolvedImages.length <= 1) return;

    const nextIndex =
      normalizedIndex === resolvedImages.length - 1 ? 0 : normalizedIndex + 1;
    const nextImage = resolvedImages[nextIndex];

    if (!nextImage || nextImage === FALLBACK_PRODUCT_IMAGE) return;

    const preloadImage = new window.Image();
    preloadImage.src = nextImage;
  }, [normalizedIndex, resolvedImages]);

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
            sizes="(max-width: 992px) 100vw, 560px"
            onError={() => {
              const originalSrc = safeImages[normalizedIndex];
              if (originalSrc && originalSrc !== FALLBACK_PRODUCT_IMAGE) {
                setBrokenImages((prev) => ({ ...prev, [originalSrc]: true }));
              }
            }}
          />

          {hasMultipleImages && (
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
          )}
        </div>

        {hasMultipleImages && (
          <div className={styles.galleryFooter}>
            <div className={styles.galleryDots}>
              {resolvedImages.map((_, index) => (
                <button
                  key={`${title}-${index}`}
                  type="button"
                  className={`${styles.galleryDot} ${
                    index === normalizedIndex ? styles.galleryDotActive : ''
                  }`}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Перейти до фото ${index + 1}`}
                />
              ))}
            </div>

            <div className={styles.galleryCounter}>
              {normalizedIndex + 1} / {resolvedImages.length}
            </div>
          </div>
        )}
      </div>

      {isZoomOpen && (
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

            {hasMultipleImages && (
              <button
                type="button"
                className={`${styles.zoomArrow} ${styles.zoomArrowLeft}`}
                onClick={showPrev}
                aria-label="Попереднє фото"
              >
                ←
              </button>
            )}

            <div className={styles.zoomImageWrapper}>
              <Image
                src={currentImage}
                alt={title}
                fill
                className={styles.zoomImage}
                sizes="100vw"
                onError={() => {
                  const originalSrc = safeImages[normalizedIndex];
                  if (originalSrc && originalSrc !== FALLBACK_PRODUCT_IMAGE) {
                    setBrokenImages((prev) => ({ ...prev, [originalSrc]: true }));
                  }
                }}
              />
            </div>

            {hasMultipleImages && (
              <button
                type="button"
                className={`${styles.zoomArrow} ${styles.zoomArrowRight}`}
                onClick={showNext}
                aria-label="Наступне фото"
              >
                →
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}