'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';
import ViberModal from '@/components/ui/ViberModal';

const EMAIL = 'ldk.partner.lviv@gmail.com';
const MAPS_LINK = 'https://maps.app.goo.gl/9NGfCBWctETQbjSC7';

type FooterSection = 'catalog' | 'schedule' | 'address' | 'email' | 'contacts';

const Footer = () => {
  const [copied, setCopied] = useState(false);
  const [isViberModalOpen, setIsViberModalOpen] = useState(false);
  const [openSection, setOpenSection] = useState<FooterSection | null>(null);

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

  const toggleSection = (section: FooterSection) => {
    setOpenSection((current) => (current === section ? null : section));
  };

  const renderMobileTitle = (section: FooterSection, title: string) => {
    const isOpen = openSection === section;

    return (
      <button
        type="button"
        className={styles.mobileAccordionButton}
        onClick={() => toggleSection(section)}
        aria-expanded={isOpen}
      >
        <span>{title}</span>

        <svg
          className={`${styles.mobileAccordionIcon} ${
            isOpen ? styles.mobileAccordionIconOpen : ''
          }`}
          aria-hidden="true"
        >
          <use href="/icons/symbol-defs.svg#arrow_back_ios_new" />
        </svg>
      </button>
    );
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
            <Link href="/catalog" className={`${styles.titleLink} ${styles.desktopTitle}`}>
              Каталог
            </Link>

            {renderMobileTitle('catalog', 'Каталог')}

            <div
              className={`${styles.accordionContent} ${
                openSection === 'catalog' ? styles.accordionContentOpen : ''
              }`}
            >
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
          </div>

          <div className={styles.column}>
            <h3 className={`${styles.title} ${styles.desktopTitle}`}>Графік роботи</h3>

            {renderMobileTitle('schedule', 'Графік роботи')}

            <div
              className={`${styles.accordionContent} ${
                openSection === 'schedule' ? styles.accordionContentOpen : ''
              }`}
            >
              <ul className={styles.list}>
                <li className={styles.text}>Пн-пт: 9:00-18:00</li>
                <li className={styles.text}>Сб: 10:00-15:00</li>
                <li className={styles.text}>Нд: вихідний</li>
              </ul>
            </div>
          </div>

          <div className={styles.column}>
            <h3 className={`${styles.title} ${styles.desktopTitle}`}>Адреса</h3>

            {renderMobileTitle('address', 'Адреса')}

            <div
              className={`${styles.accordionContent} ${
                openSection === 'address' ? styles.accordionContentOpen : ''
              }`}
            >
              <a
                href={MAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                вул. Зелена, 149 б
              </a>
            </div>
          </div>

          <div className={styles.column}>
            <h3 className={`${styles.title} ${styles.desktopTitle}`}>Ел. пошта:</h3>

            {renderMobileTitle('email', 'Ел. пошта')}

            <div
              className={`${styles.accordionContent} ${
                openSection === 'email' ? styles.accordionContentOpen : ''
              }`}
            >
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
          </div>

          <div className={styles.column}>
            <h3 className={`${styles.title} ${styles.desktopTitle}`}>Контакти</h3>

            {renderMobileTitle('contacts', 'Контакти')}

            <div
              className={`${styles.accordionContent} ${
                openSection === 'contacts' ? styles.accordionContentOpen : ''
              }`}
            >
              <div className={styles.contacts}>
                <a href="tel:+380989445599" className={styles.link}>
                  +380 98 944 55 99
                </a>
                <a href="tel:+380960025599" className={styles.link}>
                  +380 96 002 55 99
                </a>
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