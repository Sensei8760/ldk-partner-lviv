'use client';

import { useEffect, useState } from 'react';
import styles from './Consultation.module.css';
import ContactModal from '@/components/ui/ContactModal';
import Toast from '@/components/ui/Toast';

const consultationItems = [
  'Відповідаємо протягом 5 хвилин',
  'Безкоштовна консультація',
  'Без зобов’язань',
];

type ToastState = {
  show: boolean;
  message: string;
  type: 'success' | 'error';
};

export default function Consultation() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({
      show: true,
      message,
      type,
    });
  };

  useEffect(() => {
    if (!toast.show) return;

    const timeoutId = window.setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        show: false,
      }));
    }, 3500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toast.show]);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>
          Підберемо ідеальні двері
          <br />
          під ваш інтер’єр за 10 хвилин
        </h2>

        <p className={styles.subtitle}>
          Допоможемо обрати модель, перевіримо наявність і запропонуємо найкращу
          ціну
        </p>

        <button
          type="button"
          className={styles.button}
          onClick={() => setIsModalOpen(true)}
        >
          <span>Отримати консультацію</span>
          <span className={styles.arrow} aria-hidden="true">
            →
          </span>
        </button>

        <ul className={styles.list}>
          {consultationItems.map((item) => (
            <li key={item} className={styles.listItem}>
              <svg className={styles.checkIcon} aria-hidden="true">
                <use href="/icons/symbol-defs.svg?v=2#icon-untitled" />
              </svg>

              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <ContactModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(message) => showToast(message, 'success')}
        onError={(message) => showToast(message, 'error')}
      />

      <Toast show={toast.show} message={toast.message} type={toast.type} />
    </section>
  );
}