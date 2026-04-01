import Link from "next/link";
import styles from "./Contacts.module.css";

export default function Contacts() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.title}>Зв’яжіться з нами</h2>

          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <div className={styles.iconCircle}>
                <svg className={styles.infoIcon} aria-hidden="true">
                  <use href="/icons/symbol-defs.svg?v=6#icon-clock-clean" />
                </svg>
              </div>

              <div className={styles.infoContent}>
                <p className={styles.label}>Графік роботи:</p>
                <p className={styles.text}>Пн-пт: 9:00-18:00</p>
                <p className={styles.text}>Сб: 10:00-15:00</p>
                <p className={styles.text}>Нд: вихідний</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.iconCircle}>
                <svg className={styles.infoIcon} aria-hidden="true">
                  <use href="/icons/symbol-defs.svg?v=6#icon-location-clean" />
                </svg>
              </div>

              <div className={styles.infoContent}>
                <p className={styles.label}>Адреса:</p>
                <p className={styles.text}>вул. Зелена, 149 б</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.iconCircle}>
                <svg className={styles.infoIcon} aria-hidden="true">
                  <use href="/icons/symbol-defs.svg?v=7#icon-phone-clean" />
                </svg>
              </div>

              <div className={styles.infoContent}>
                <p className={styles.label}>Телефон:</p>
                <Link href="tel:+380989445599" className={styles.contactLink}>
                  +380 98 944 55 99
                </Link>
                <Link href="tel:+380960025599" className={styles.contactLink}>
                  +380 96 002 55 99
                </Link>
              </div>
            </div>
          </div>

          <div className={styles.socials}>
            <Link href="#" className={styles.socialLink} aria-label="Telegram">
              <svg className={styles.socialIcon} aria-hidden="true">
                <use href="/icons/symbol-defs.svg?v=6#icon-Vector1" />
              </svg>
            </Link>

            <Link href="#" className={styles.socialLink} aria-label="Viber">
              <svg className={styles.socialIcon} aria-hidden="true">
                <use href="/icons/symbol-defs.svg?v=6#icon-Vector2" />
              </svg>
            </Link>

            <Link href="mailto:" className={styles.socialLink} aria-label="Email">
              <svg className={styles.socialIcon} aria-hidden="true">
                <use href="/icons/symbol-defs.svg?v=7#icon-mail-clean" />
              </svg>
            </Link>
          </div>
        </div>

        <div className={styles.mapWrap}>
          <iframe
            className={styles.mapFrame}
            src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d939.9220725307831!2d24.062654200611696!3d49.81344968492867!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zNDnCsDQ4JzQ4LjUiTiAyNMKwMDMnNDguNyJF!5e0!3m2!1suk!2sua!4v1775074696725!5m2!1suk!2sua"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Мапа розташування"
          />
        </div>
      </div>
    </section>
  );
}