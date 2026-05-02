'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';
import ViberModal from '@/components/ui/ViberModal';

const EMAIL = 'ldk.partner.lviv@gmail.com';
const MAPS_LINK = 'https://maps.app.goo.gl/9NGfCBWctETQbjSC7';

const Footer = () => {
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
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.logoBlock}>
          <Link href="/" className={styles.logoLink} aria-label="Перейти на головну">
            <svg className={styles.logo} aria-hidden="true">
              <use href="/icons/symbol-defs.svg#icon-logo" />
            </svg>
          </Link>

          <p className={styles.copy}>© 2026 LDK Partner</p>
        </div>

        <div className={styles.content}>
          <div className={styles.column}>
            <Link href="/catalog" className={styles.titleLink}>
              Каталог
            </Link>

            <ul className={styles.list}>
              <li>
                <Link href="/catalog?type=entrance" className={styles.link}>
                  Вхідні двері
                </Link>
              </li>
              <li>
                <Link href="/catalog?type=interior" className={styles.link}>
                  Міжкімнатні двері
                </Link>
              </li>
              <li>
                <Link href="/catalog?type=sale" className={styles.link}>
                  Знижки
                </Link>
              </li>
            </ul>
          </div>

          <div className={styles.column}>
            <h3 className={styles.title}>Адреса</h3>

            <a
              href={MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              вул. Зелена, 149 б
            </a>
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
            <h3 className={styles.title}>Ел. пошта:</h3>

            <div className={styles.emailWrap}>
              <button
                type="button"
                className={styles.emailButton}
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
              <Link href="https://t.me/LDK_Partner_Lviv" className={styles.socialLink} aria-label="Telegram">
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
        </div>
      </div>

      <ViberModal
        open={isViberModalOpen}
        onClose={() => setIsViberModalOpen(false)}
      />
    </footer>
  );
};

export default Footer;