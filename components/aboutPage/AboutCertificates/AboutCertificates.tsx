'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './AboutCertificates.module.css';

const certificates = Array.from({ length: 4 }, (_, index) => ({
  src: `/images/Certificate/certificate-${index + 1}.jpg`,
  alt: `Сертифікат відповідності Portala ${index + 1}`,
}));

export default function AboutCertificates() {
  const middleStartIndex = certificates.length;

  const [isMobile, setIsMobile] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(middleStartIndex);
  const [slideStep, setSlideStep] = useState(0);
  const [withTransition, setWithTransition] = useState(true);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const isAnimatingRef = useRef(false);

  const loopCertificates = useMemo(() => {
    return [...certificates, ...certificates, ...certificates];
  }, []);

  const shownCertificates = isMobile ? loopCertificates : certificates;

  const updateSlideStep = useCallback(() => {
    requestAnimationFrame(() => {
      const firstSlide = trackRef.current?.querySelector<HTMLElement>(
        `.${styles.card}`
      );

      if (!firstSlide) return;

      setSlideStep(firstSlide.offsetWidth);
    });
  }, []);

  useEffect(() => {
    const updateMode = () => {
      setIsMobile(window.innerWidth <= 560);
    };

    updateMode();
    window.addEventListener('resize', updateMode);

    return () => {
      window.removeEventListener('resize', updateMode);
    };
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    updateSlideStep();
    window.addEventListener('resize', updateSlideStep);

    return () => {
      window.removeEventListener('resize', updateSlideStep);
    };
  }, [isMobile, updateSlideStep]);

  const goPrev = () => {
    if (!isMobile || isAnimatingRef.current || slideStep === 0) return;

    isAnimatingRef.current = true;
    setWithTransition(true);
    setCurrentIndex((prev) => prev - 1);
  };

  const goNext = () => {
    if (!isMobile || isAnimatingRef.current || slideStep === 0) return;

    isAnimatingRef.current = true;
    setWithTransition(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleTransitionEnd = () => {
    if (!isMobile) return;

    isAnimatingRef.current = false;

    if (currentIndex >= certificates.length * 2) {
      setWithTransition(false);
      setCurrentIndex((prev) => prev - certificates.length);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setWithTransition(true);
        });
      });

      return;
    }

    if (currentIndex < certificates.length) {
      setWithTransition(false);
      setCurrentIndex((prev) => prev + certificates.length);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setWithTransition(true);
        });
      });
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <p className={styles.label}>Якість</p>

        <h2 className={styles.title}>Сучасний підхід та сертифікація</h2>

        <p className={styles.text}>
          Беремо участь у профільних виставках InterBuildExpo, KyivBuild та
          EuroBuild, щоб впроваджувати актуальні технології, стежити за
          трендами ринку та постійно вдосконалювати виробництво.
        </p>

        <div className={styles.slider}>
          <div className={styles.viewport}>
            <div
              ref={trackRef}
              className={styles.track}
              onTransitionEnd={handleTransitionEnd}
              style={
                isMobile
                  ? {
                      transform: `translateX(-${currentIndex * slideStep}px)`,
                      transition: withTransition
                        ? 'transform 0.45s ease'
                        : 'none',
                    }
                  : undefined
              }
            >
              {shownCertificates.map((certificate, index) => (
                <div className={styles.card} key={`${certificate.src}-${index}`}>
                  <Image
                    src={certificate.src}
                    alt={certificate.alt}
                    width={300}
                    height={420}
                    className={styles.image}
                    priority={index < 4}
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
              aria-label="Попередній сертифікат"
            >
              <svg className={styles.arrowIcon} aria-hidden="true">
                <use href="/icons/symbol-defs.svg?v=6#arrow_back_ios_new" />
              </svg>
            </button>

            <button
              type="button"
              className={`${styles.arrow} ${styles.arrowRight}`}
              onClick={goNext}
              aria-label="Наступний сертифікат"
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