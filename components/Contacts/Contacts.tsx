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
                  <use href="/icons/symbol-defs.svg#icon-Frame-46" />
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
                  <use href="/icons/symbol-defs.svg#icon-Frame-44" />
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
                  <use href="/icons/symbol-defs.svg#icon-Frame-45" />
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
                <use href="/icons/symbol-defs.svg#?v=7#icon-mail-clean" />
              </svg>
            </Link>
          </div>
        </div>

        <div className={styles.mapWrap}>
          <iframe
            className={styles.mapFrame}
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1082.4619379653548!2d24.062414726623626!3d49.81346110489668!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x473ae986227e3bb5%3A0x54732002e82b48c5!2zTERLIFBhcnRuZXIgfCDQm9GM0LLRltCyIHwg0JLRhdGW0LTQvdGWINGC0LAg0LzRltC20LrRltC80L3QsNGC0L3RliDQtNCy0LXRgNGWINCi0JwgIlBvcnRhbGEi!5e0!3m2!1suk!2sua!4v1775328545627!5m2!1suk!2sua"
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