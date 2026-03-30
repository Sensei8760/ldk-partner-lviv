'use client';

import { useEffect, useRef, useState } from 'react';
import StaffLoginForm from '@/components/auth/StaffLoginForm';
import styles from './StaffLoginDot.module.css';

export default function StaffLoginDot() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={styles.dot}
        aria-label="Вхід для персоналу"
        onClick={() => setOpen((prev) => !prev)}
      >
        •
      </button>

      {open ? (
        <div className={styles.panel}>
          <p className={styles.title}>Вхід для персоналу</p>
          <StaffLoginForm compact onSuccess={() => setOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}