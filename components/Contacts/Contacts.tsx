'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './Contacts.module.css';
import ViberModal from '@/components/ui/ViberModal';

const EMAIL = 'ldk.partner.lviv@gmail.com';
const MAPS_LINK = 'https://maps.app.goo.gl/9NGfCBWctETQbjSC7';

export default function Contacts() {
  const [copied, setCopied] = useState(false);
  const [isViberModalOpen, setIsViberModalOpen] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section id="contacts" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.title}>Зв&apos;яжіться з нами</h2>

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

                <a
                  href={MAPS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.contactLink} ${styles.interactiveLink}`}
                >
                  вул. Зелена, 149 б
                </a>
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

            <div className={styles.infoItem}>
              <div className={styles.iconCircle}>
                <svg className={styles.infoIcon} aria-hidden="true">
                  <use href="/icons/symbol-defs.svg#icon-Frame-50" />
                </svg>
              </div>

              <div className={styles.infoContent}>
                <p className={styles.label}>Ел. пошта:</p>

                <button
                  type="button"
                  className={`${styles.contactButton} ${styles.interactiveLink}`}
                  onClick={handleCopyEmail}
                  aria-label="Скопіювати електронну пошту"
                  title="Скопіювати електронну пошту"
                >
                  {EMAIL}
                </button>

                <span
                  className={`${styles.copyStatus} ${
                    copied ? styles.copyStatusVisible : ''
                  }`}
                >
                  Скопійовано
                </span>
              </div>
            </div>
          </div>

          <div className={styles.socials}>
            <Link
              href="https://t.me/LDK_Partner_Lviv"
              className={styles.socialLink}
              aria-label="Telegram"
            >
              <svg
                className={`${styles.socialIcon} ${styles.telegramIcon}`}
                aria-hidden="true"
              >
                <use href="/icons/symbol-defs.svg?v=6#icon-Vector1" />
              </svg>
            </Link>

            <button
              type="button"
              className={`${styles.socialLink} ${styles.socialButton}`}
              aria-label="Viber"
              onClick={() => setIsViberModalOpen(true)}
            >
              <svg
                className={`${styles.socialIcon} ${styles.viberIcon}`}
                aria-hidden="true"
              >
                <use href="/icons/symbol-defs.svg?v=6#icon-Vector2" />
              </svg>
            </button>
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

      <ViberModal
        open={isViberModalOpen}
        onClose={() => setIsViberModalOpen(false)}
      />
    </section>
  );
}