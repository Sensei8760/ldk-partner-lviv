'use client';

import styles from './Toast.module.css';

type ToastProps = {
  show: boolean;
  message: string;
  type?: 'success' | 'error';
};

export default function Toast({
  show,
  message,
  type = 'success',
}: ToastProps) {
  if (!show) return null;

  return (
    <div
      className={`${styles.toast} ${
        type === 'success' ? styles.success : styles.error
      }`}
    >
      {message}
    </div>
  );
}