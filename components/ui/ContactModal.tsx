'use client';

import { FormEvent, useEffect, useState } from 'react';
import styles from './ContactModal.module.css';

type ContactModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
};

const ANIMATION_DURATION = 220;

export default function ContactModal({
  open,
  onClose,
  onSuccess,
  onError,
}: ContactModalProps) {
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

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');
  const [website, setWebsite] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      if (event.key === 'Escape' && !isLoading) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, isLoading, onClose]);

  if (!shouldRender) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          phone,
          comment,
          website,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'Не вдалося надіслати заявку.');
      }

      setName('');
      setPhone('');
      setComment('');
      setWebsite('');

      onClose();
      onSuccess('Заявку надіслано. Ми скоро з вами зв’яжемося.');
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : 'Не вдалося надіслати заявку.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  return (
    <div
      className={`${styles.overlay} ${isClosing ? styles.overlayClosing : ''}`}
      onClick={handleClose}
    >
      <div
        className={`${styles.modal} ${isClosing ? styles.modalClosing : ''}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Закрити форму"
          disabled={isLoading}
        >
          ×
        </button>

        <h3 id="contact-modal-title" className={styles.title}>
          Отримати консультацію
        </h3>

        <p className={styles.subtitle}>
  Залиште контакти, і ми зв’яжемося з вами.
</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.hiddenInput}
            type="text"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />

          <label className={styles.field}>
            <span className={styles.label}>Ім’я</span>
            <input
              className={styles.input}
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Наприклад: Олена"
              autoComplete="name"
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Телефон</span>
            <input
              className={styles.input}
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+380..."
              autoComplete="tel"
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Коментар</span>
            <textarea
              className={styles.textarea}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Напишіть, які двері вас цікавлять..."
              rows={4}
              maxLength={1000}
            />
          </label>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Надсилання...' : 'Надіслати заявку'}
          </button>
        </form>
      </div>
    </div>
  );
}