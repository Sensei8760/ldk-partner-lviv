'use client';

import { FormEvent, useEffect, useState } from 'react';
import styles from './ContactModal.module.css';

type ContactModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
};

export default function ContactModal({
  open,
  onClose,
  onSuccess,
  onError,
}: ContactModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');
  const [website, setWebsite] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  if (!open) return null;

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

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Закрити форму"
          disabled={isLoading}
        >
          ×
        </button>

        <h3 id="contact-modal-title" className={styles.title}>
          Отримати консультацію
        </h3>

        <p className={styles.subtitle}>
          Залиште контакти, і ми допоможемо підібрати двері.
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
              placeholder="Ваше ім’я"
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
              placeholder="Напишіть, які двері вас цікавлять"
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