import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logoLink} aria-label="На головну">
          <svg className={styles.logo}>
            <use href="/icons/symbol-defs.svg#icon-logo" />
          </svg>
        </Link>

        <nav className={styles.nav} aria-label="Основна навігація">
          <Link href="/about" className={styles.navLink}>
            Про нас
          </Link>

          <Link href="/catalog" className={styles.navLink}>
            Каталог
          </Link>

          <Link href="/contacts" className={styles.navLink}>
            Контакти
          </Link>
        </nav>

        <Link
          href="/login-staff"
          className={styles.userLink}
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