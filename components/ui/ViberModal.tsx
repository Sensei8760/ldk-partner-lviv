'use client';

import styles from './ViberModal.module.css';

type ViberModalProps = {
  open: boolean;
  onClose: () => void;
};

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
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
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