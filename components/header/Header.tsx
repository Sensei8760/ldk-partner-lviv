'use client';

import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  const handleContactsClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.location.pathname !== '/') {
      return;
    }

    event.preventDefault();

    const contactsSection = document.getElementById('contacts');

    if (contactsSection) {
      contactsSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });

      window.history.pushState(null, '', '/#contacts');
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logoLink} aria-label="На головну">
          <svg className={styles.logo}>
            <use href="/icons/symbol-defs.svg#icon-logo" />
          </svg>
        </Link>

        <nav className={styles.nav} aria-label="Основна навігація">
          <Link href="/about-us" className={styles.navLink}>
            Про нас
          </Link>

          <Link href="/catalog" className={styles.navLink}>
            Каталог
          </Link>

          <Link
            href="/#contacts"
            className={styles.navLink}
            onClick={handleContactsClick}
          >
            Контакти
          </Link>
        </nav>
      </div>
    </header>
  );
}