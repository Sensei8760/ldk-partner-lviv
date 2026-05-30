'use client';

import { useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleContactsClick = (event: MouseEvent<HTMLAnchorElement>) => {
    closeMenu();

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

  const getLinkClassName = (href: string) => {
    const isActive =
      href === '/'
        ? pathname === '/'
        : pathname === href || pathname.startsWith(`${href}/`);

    return `${styles.navLink} ${isActive ? styles.activeLink : ''}`;
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link
          href="/"
          className={styles.logoLink}
          aria-label="На головну"
          onClick={closeMenu}
        >
          <svg className={styles.logo}>
            <use href="/icons/symbol-defs.svg#icon-logo" />
          </svg>
        </Link>

        <button
  type="button"
  className={`${styles.burgerButton} ${
    isMenuOpen ? styles.burgerButtonOpen : ''
  }`}
  onClick={() => setIsMenuOpen((prev) => !prev)}
  aria-label={isMenuOpen ? 'Закрити меню' : 'Відкрити меню'}
  aria-expanded={isMenuOpen}
>
  <svg className={styles.burgerIcon}>
    <use href="/icons/symbol-defs.svg?v=7#icon-burger" />
  </svg>
</button>

        <nav
          className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}
          aria-label="Основна навігація"
        >
          <Link
            href="/"
            className={getLinkClassName('/')}
            onClick={closeMenu}
          >
            Головна
          </Link>

          <Link
            href="/about-us"
            className={getLinkClassName('/about-us')}
            onClick={closeMenu}
          >
            Про нас
          </Link>

          <Link
            href="/catalog"
            className={getLinkClassName('/catalog')}
            onClick={closeMenu}
          >
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