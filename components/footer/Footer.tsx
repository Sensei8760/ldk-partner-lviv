import Link from 'next/link';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.logoBlock}>
          <Link href="/" className={styles.logoLink} aria-label="Перейти на головну">
            <svg className={styles.logo}>
              <use href="/icons/symbol-defs.svg#icon-logo" />
            </svg>
          </Link>

          <p className={styles.copy}>© 2026 LDK Partner</p>
        </div>

        <div className={styles.content}>
          <div className={styles.column}>
            <h3 className={styles.title}>Каталог</h3>
            <ul className={styles.list}>
              <li>
                <Link href="/catalog/vhidni-dveri" className={styles.link}>
                  Вхідні двері
                </Link>
              </li>
              <li>
                <Link href="/catalog/mizhkimnatni-dveri" className={styles.link}>
                  Міжкімнатні двері
                </Link>
              </li>
              <li>
                <Link href="/sale" className={styles.link}>
                  Акції
                </Link>
              </li>
            </ul>
          </div>

          <div className={styles.column}>
            <h3 className={styles.title}>Графік роботи</h3>
            <ul className={styles.list}>
              <li className={styles.text}>Пн-пт: 9:00-18:00</li>
              <li className={styles.text}>Сб: 10:00-15:00</li>
              <li className={styles.text}>Нд: вихідний</li>
            </ul>
          </div>

          <div className={styles.column}>
            <h3 className={styles.title}>Адреса</h3>
            <p className={styles.text}>вул. Зелена, 149 б</p>
          </div>

          <div className={styles.column}>
            <h3 className={styles.title}>Контакти</h3>

            <div className={styles.contacts}>
              <a href="tel:+380989445599" className={styles.link}>
                +380 98 944 55 99
              </a>
              <a href="tel:+380960025599" className={styles.link}>
                +380 96 002 55 99
              </a>
            </div>

            <div className={styles.socials}>
              <a
                href="https://t.me/"
                target="_blank"
                rel="noreferrer"
                className={styles.social}
                aria-label="Telegram"
              >
                TG
              </a>

              <a
                href="viber://chat?number=%2B380989445599"
                className={styles.social}
                aria-label="Viber"
              >
                VB
              </a>

              <a
                href="mailto:example@gmail.com"
                className={styles.social}
                aria-label="Email"
              >
                @
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;