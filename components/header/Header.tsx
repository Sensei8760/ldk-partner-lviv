"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";

export default function Header() {
  const pathname = usePathname();

  const isAboutActive = pathname === "/about";
  const isCatalogActive = pathname === "/catalog" || pathname.startsWith("/catalog/");
  const isContactsActive = pathname === "/contacts";
  const isLoginActive = pathname === "/login-staff";

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logoLink} aria-label="На головну">
          <svg className={styles.logo}>
            <use href="/icons/symbol-defs.svg#icon-logo" />
          </svg>
        </Link>

        <nav className={styles.nav} aria-label="Основна навігація">
          <Link
            href="/about"
            className={`${styles.navLink} ${isAboutActive ? styles.activeLink : ""}`}
          >
            Про нас
          </Link>

          <Link
            href="/catalog"
            className={`${styles.navLink} ${isCatalogActive ? styles.activeLink : ""}`}
          >
            Каталог
          </Link>

          <Link
            href="/contacts"
            className={`${styles.navLink} ${isContactsActive ? styles.activeLink : ""}`}
          >
            Контакти
          </Link>
        </nav>

        <Link
          href="/login-staff"
          className={`${styles.userLink} ${isLoginActive ? styles.activeUser : ""}`}
          aria-label="Вхід для персоналу"
        >
          <svg className={styles.userIcon}>
            <use href="/icons/symbol-defs.svg#icon-fi-bs-user" />
          </svg>
        </Link>
      </div>
    </header>
  );
}