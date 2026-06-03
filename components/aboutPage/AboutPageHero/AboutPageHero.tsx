'use client';

import { useState } from 'react';
import styles from './AboutPageHero.module.css';

const features = [
  {
    icon: 'icon-about-us-1',
    title: 'Власне виробництво',
    text: 'Від проєктування та підбору матеріалів до готових дверей',
  },
  {
    icon: 'icon-about-us-2',
    title: 'Контроль якості',
    text: 'Перевірка якості на кожному етапі виробництва',
  },
  {
    icon: 'icon-about-us-3',
    title: 'Індивідуальні рішення',
    text: 'Враховуємо планування, стиль та особливості кожного об’єкта',
  },
];

const steps = [
  {
    number: '01',
    title: 'Аналізуємо задачу',
    text: 'Вивчаємо об’єкт, вимоги та побажання, щоб запропонувати найкраще рішення.',
  },
  {
    number: '02',
    title: 'Підбираємо рішення',
    text: 'Підбираємо конструкцію, матеріали, дизайн та фурнітуру під бюджет і дизайн.',
  },
  {
    number: '03',
    title: 'Виготовляємо двері',
    text: 'Сучасне обладнання та багаторічний досвід майстрів для бездоганного результату.',
  },
  {
    number: '04',
    title: 'Супроводжуємо',
    text: 'Доставка, монтаж і сервіс — усе під нашим контролем.',
  },
];

export default function AboutPageHero() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.content}>
          <p className={styles.label}>Про нас</p>

          <h1 className={styles.title}>
            Portala — виробництво дверей, де поєднуються інженерна досконалість
            і сучасний дизайн
          </h1>

          <div className={styles.textArea}>
            <div className={styles.text}>
              <p>
                Ми створюємо вхідні та міжкімнатні двері, що відповідають
                найвищим стандартам безпеки, якості та естетики. Кожна модель —
                це використання преміальних матеріалів та з увагою до кожної
                деталі. Вхідні двері Portala — це не просто захист. Це відчуття
                впевненості, тиші та комфорту, яке починається з першого дотику.
              </p>

              <div
                className={`${styles.expandedText} ${
                  isExpanded ? styles.expandedTextOpen : ''
                }`}
              >
                <p>
                  Portala — це свобода реалізації ідей. Ви можете надіслати
                  фото, референс або ескіз — і ми втілимо рішення, яке буде
                  ідеально відповідати вашому простору та стилю життя. Ми
                  постійно оновлюємо колекції, щоб пропонувати актуальні
                  дизайнерські рішення для сучасних інтер’єрів.
                </p>
              </div>
            </div>

            <button
              type="button"
              className={styles.detailsButton}
              onClick={() => setIsExpanded((prev) => !prev)}
            >
              {isExpanded ? 'Згорнути' : 'Детальніше'}

              <svg
                className={`${styles.detailsIcon} ${
                  isExpanded ? styles.detailsIconOpen : ''
                }`}
                aria-hidden="true"
              >
                <use href="/icons/symbol-defs.svg?v=6#arrow_back_ios_new" />
              </svg>
            </button>
          </div>
        </div>

        <div className={styles.photoShape} aria-hidden="true">
          <svg
            className={styles.photoShapeSvg}
            viewBox="0 0 47 32"
            preserveAspectRatio="none"
          >
            <defs>
              <clipPath id="about-photo-shape" clipPathUnits="userSpaceOnUse">
                <path d="M0 12.676c-0-3.799 7.427-12.676 7.427-12.676h39.154v32h-26.894c0 0-19.687-15.525-19.687-19.324z" />
              </clipPath>
            </defs>

            <image
              href="/images/about-us-1.jpg"
              x="0"
              y="0"
              width="47"
              height="32"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#about-photo-shape)"
            />
          </svg>
        </div>

        <ul
          className={`${styles.features} ${
            isExpanded ? styles.featuresHidden : ''
          }`}
        >
          {features.map((item) => (
            <li className={styles.featureItem} key={item.title}>
              <svg className={styles.featureIcon} aria-hidden="true">
                <use href={`/icons/symbol-defs.svg?v=6#${item.icon}`} />
              </svg>

              <div>
                <h2 className={styles.featureTitle}>{item.title}</h2>
                <p className={styles.featureText}>{item.text}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className={styles.stepsBlock}>
          {steps.map((item) => (
            <article className={styles.stepItem} key={item.number}>
              <p className={styles.stepNumber}>{item.number}</p>
              <h2 className={styles.stepTitle}>{item.title}</h2>
              <p className={styles.stepText}>{item.text}</p>

              <div className={styles.stepArrowWrap} aria-hidden="true">
                <svg className={styles.stepArrow}>
                  <use href="/icons/symbol-defs.svg?v=6#icon-Arrow-2" />
                </svg>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}