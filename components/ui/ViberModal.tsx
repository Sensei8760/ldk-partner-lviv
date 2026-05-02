'use client';

import { useEffect, useState } from 'react';
import styles from './ViberModal.module.css';

type ViberModalProps = {
  open: boolean;
  onClose: () => void;
};

const ANIMATION_DURATION = 220;

const viberNumbers = [
  {
    label: '+380 98 944 55 99',
    href: 'viber://chat?number=%2B380989445599',
  },
  {
    label: '+380 96 002 55 99',
    href: 'viber://chat?number=%2B380960025599',
  },
];

export default function ViberModal({ open, onClose }: ViberModalProps) {
  const [shouldRender, setShouldRender] = useState(open);
  const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
  if (!shouldRender) return;

  const originalBodyOverflow = document.body.style.overflow;
  const originalBodyPaddingRight = document.body.style.paddingRight;
  const originalHtmlOverflow = document.documentElement.style.overflow;

  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;

  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';

  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }

  return () => {
    document.body.style.overflow = originalBodyOverflow;
    document.body.style.paddingRight = originalBodyPaddingRight;
    document.documentElement.style.overflow = originalHtmlOverflow;
  };
}, [shouldRender]);
    
  useEffect(() => {
    let openTimeoutId: number | undefined;
    let closeStartTimeoutId: number | undefined;
    let closeEndTimeoutId: number | undefined;

    if (open) {
      openTimeoutId = window.setTimeout(() => {
        setShouldRender(true);
        setIsClosing(false);
      }, 0);
    } else if (shouldRender) {
      closeStartTimeoutId = window.setTimeout(() => {
        setIsClosing(true);
      }, 0);

      closeEndTimeoutId = window.setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, ANIMATION_DURATION);
    }

    return () => {
      if (openTimeoutId) window.clearTimeout(openTimeoutId);
      if (closeStartTimeoutId) window.clearTimeout(closeStartTimeoutId);
      if (closeEndTimeoutId) window.clearTimeout(closeEndTimeoutId);
    };
  }, [open, shouldRender]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!shouldRender) return null;

  return (
    <div
      className={`${styles.overlay} ${isClosing ? styles.overlayClosing : ''}`}
      onClick={onClose}
    >
      <div
        className={`${styles.modal} ${isClosing ? styles.modalClosing : ''}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="viber-modal-title"
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Закрити"
        >
          ×
        </button>

        <h3 id="viber-modal-title" className={styles.title}>
          Оберіть номер Viber
        </h3>

        <p className={styles.text}>
          На обидва номери можна написати у Viber.
        </p>

        <div className={styles.numbers}>
          {viberNumbers.map((number) => (
            <a
              key={number.href}
              href={number.href}
              className={styles.numberLink}
              onClick={onClose}
            >
              {number.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}