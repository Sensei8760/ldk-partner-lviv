import styles from './Footer.module.css';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.contacts}>
          <h2>Звʼяжіться з нами</h2>

          <p>Телефон: +380 98 944 55 99</p>
          <p>+380 96 002 55 99</p>

          <div className={styles.socials}>
            <a href="#" aria-label="Telegram">T</a>
            <a href="#" aria-label="Viber">V</a>
            <a href="#" aria-label="X">X</a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <Link href="/">Каталог залишків дверей</Link>

        <p>2024 Door Solutions. Всі права захищено.</p>
      </div>
    </footer>
  );
}