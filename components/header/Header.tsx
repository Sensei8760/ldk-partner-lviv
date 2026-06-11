'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Header.module.css';
import MobileMenu from './MobileMenu/MobileMenu';

const CONTACTS_SCROLL_KEY = 'scrollToContacts';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const scrollY = window.scrollY;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';

      window.scrollTo(0, scrollY);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (pathname !== '/') {
      return;
    }

    const shouldScrollToContacts =
      sessionStorage.getItem(CONTACTS_SCROLL_KEY) === 'true' ||
      window.location.hash === '#contacts';

    if (!shouldScrollToContacts) {
      return;
    }

    sessionStorage.removeItem(CONTACTS_SCROLL_KEY);

    const scrollToContacts = () => {
      const contactsSection = document.getElementById('contacts');

      if (!contactsSection) {
        return;
      }

      contactsSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });

      window.history.replaceState(null, '', '/#contacts');
    };

    const timeoutId = window.setTimeout(scrollToContacts, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [pathname]);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleContactsClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    sessionStorage.setItem(CONTACTS_SCROLL_KEY, 'true');
    closeMenu();

    if (pathname !== '/') {
      router.push('/');
      return;
    }

    window.setTimeout(() => {
      const contactsSection = document.getElementById('contacts');

      if (contactsSection) {
        contactsSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });

        window.history.replaceState(null, '', '/#contacts');
      }
    }, 300);
  };

  const getLinkClassName = (href: string) => {
    const isActive =
      href === '/'
        ? pathname === '/'
        : pathname === href || pathname.startsWith(`${href}/`);

    return `${styles.navLink} ${isActive ? styles.activeLink : ''}`;
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <Link
            href="/"
            className={styles.logoLink}
            aria-label="На головну"
            onClick={closeMenu}
          >
            <svg className={styles.logo}>
              <use href="/icons/symbol-defs.svg?v=7#icon-logo" />
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

          <nav className={styles.nav} aria-label="Основна навігація">
            <Link href="/" className={getLinkClassName('/')}>
              Головна
            </Link>

            <Link href="/about-us" className={getLinkClassName('/about-us')}>
              Про нас
            </Link>

            <Link href="/catalog" className={getLinkClassName('/catalog')}>
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

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={closeMenu}
        onContactsClick={handleContactsClick}
      />
    </>
  );
}