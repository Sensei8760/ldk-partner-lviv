'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './AboutDecision.module.css';

const images = [
  {
    src: '/images/decision-1.jpg',
    alt: 'Приватний будинок з дверима LDK Partner',
    className: 'imageBoxLarge',
  },
  {
    src: '/images/decision-2.jpg',
    alt: 'Підйом дверних конструкцій для будівельного об’єкта',
    className: 'imageBoxSmall',
  },
  {
    src: '/images/decision-3.jpg',
    alt: 'Комплексні дверні рішення для забудовників',
    className: 'imageBoxLarge',
  },
  {
    src: '/images/decision-4.jpg',
    alt: 'Міжкімнатні двері в інтер’єрі',
    className: 'imageBoxSmall',
  },
];

export default function AboutDecision() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.content}>
          <p className={styles.label}>Комплексні рішення</p>

          <h2 className={styles.title}>
            Двері під ключ для забудовників, дилерів, архітекторів і дизайнерів
          </h2>

          <div className={styles.text}>
  <p>
    LDK Partner закриває повний комплекс рішень у сфері дверей:
    вхідні, міжкімнатні, технічні та протипожежні двері для
    приватних, комерційних і будівельних об’єктів.
  </p>

  <div
    className={`${styles.mobileExpandableText} ${
      isExpanded ? styles.mobileExpandableTextOpen : ''
    }`}
  >
    <p>
      Ми беремо на себе ключові етапи роботи — від підбору
      відповідного рішення до організації виробництва, сервісу та
      логістики. Це дозволяє клієнтам не витрачати час на пошук
      кількох постачальників, узгодження між різними командами та
      контроль окремих процесів.
    </p>

    <p>
      LDK Partner — це єдина екосистема, де виробництво, сервіс і
      логістика працюють як один злагоджений процес. Завдяки цьому ми
      допомагаємо реалізовувати проєкти ефективніше, зручніше та з
      меншим навантаженням для клієнта.
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

        <div className={styles.gallery}>
          {images.map((image) => (
            <div
              className={`${styles.imageBox} ${
                styles[image.className as keyof typeof styles]
              }`}
              key={image.src}
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={280}
                height={260}
                className={styles.image}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}