'use client';

import Link from 'next/link';
import styles from './MobileMenu.module.css';

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  onContactsClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
};

const menuLinks = [
  {
    href: '/',
    label: 'Головна',
  },
  {
    href: '/about-us',
    label: 'Про нас',
  },
  {
    href: '/catalog',
    label: 'Каталог',
  },
];

export default function MobileMenu({
  isOpen,
  onClose,
  onContactsClick,
}: MobileMenuProps) {
  return (
    <div className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}>
      <div className={`${styles.menu} ${isOpen ? styles.menuOpen : ''}`}>
        <div className={styles.top}>
          <Link
            href="/"
            className={styles.logoLink}
            aria-label="На головну"
            onClick={onClose}
          >
            <svg className={styles.logo} aria-hidden="true">
              <use href="/icons/symbol-defs.svg?v=7#icon-logo" />
            </svg>
          </Link>

          <button
  type="button"
  className={styles.closeButton}
  onClick={onClose}
  aria-label="Закрити меню"
>
  <svg
    className={styles.closeIcon}
    viewBox="0 0 40 40"
    aria-hidden="true"
  >
    <path
      d="M10 10L30 30M30 10L10 30"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
</button>
        </div>

        <nav className={styles.nav} aria-label="Мобільна навігація">
          {menuLinks.map((link) => (
            <Link
              href={link.href}
              className={styles.navLink}
              onClick={onClose}
              key={link.href}
            >
              <span>{link.label}</span>

              <svg className={styles.arrowIcon} aria-hidden="true">
                <use href="/icons/symbol-defs.svg?v=7#arrow_back_ios_new" />
              </svg>
            </Link>
          ))}

          <Link
            href="/#contacts"
            className={styles.navLink}
            onClick={onContactsClick}
          >
            <span>Контакти</span>

            <svg className={styles.arrowIcon} aria-hidden="true">
              <use href="/icons/symbol-defs.svg?v=7#arrow_back_ios_new" />
            </svg>
          </Link>
        </nav>
      </div>
    </div>
  );
}