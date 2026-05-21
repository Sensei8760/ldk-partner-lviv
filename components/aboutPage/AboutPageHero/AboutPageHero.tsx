"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./AboutPageHero.module.css";

const images = [
  "/images/about-us-1.jpg",
  "/images/about-us-2.jpg",
  "/images/about-us-3.jpg",
  "/images/about-us-4.jpg",
];

export default function AboutPageHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextImage = () => {
    setActiveIndex((currentIndex) =>
      currentIndex === images.length - 1 ? 0 : currentIndex + 1
    );
  };

  useEffect(() => {
    if (isHovered) return;

    const timer = setInterval(() => {
      nextImage();
    }, 3500);

    return () => clearInterval(timer);
  }, [isHovered]);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.content}>
          <p className={styles.label}>Про нас</p>

          <h1 className={styles.title}>
            Portala — виробництво дверей, де поєднуються інженерна
            досконалість і сучасний дизайн
          </h1>

          <div className={styles.text}>
            <p>
              Ми створюємо вхідні та міжкімнатні двері, які відповідають
              найвищим стандартам безпеки, якості та естетики. Кожна модель —
              це використання преміальних матеріалів та увага до кожної деталі.
              Вхідні двері Portala — це не просто захист. Це відчуття
              впевненості, тиші та комфорту, яке починається з першого дотику.
            </p>
          </div>

          <div className={styles.offer}>
            <p className={styles.offerTitle}>Ми пропонуємо:</p>

            <ul className={styles.list}>
              <li>вхідні двері підвищеної надійності</li>
              <li>міжкімнатні двері власного виробництва фарбовані</li>
              <li>протипожежні конструкції</li>
              <li>розсувні системи</li>
              <li>індивідуальне виробництво за вашим дизайном</li>
            </ul>
          </div>

          <p className={styles.bottomText}>
            Portala — це свобода реалізації ідей. Ви можете надіслати фото,
            референс або ескіз — і ми втілимо рішення, яке буде ідеально
            відповідати вашому простору та стилю життя. Ми постійно оновлюємо
            колекції, щоб пропонувати актуальні дизайнерські рішення для
            сучасних інтер’єрів.
          </p>
        </div>

        <button
          type="button"
          className={styles.imageBox}
          onClick={nextImage}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label="Переглянути наступне фото"
        >
          <div
            className={styles.sliderTrack}
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {images.map((image, index) => (
              <div className={styles.slide} key={image}>
                <Image
                  src={image}
                  alt={`Виробництво дверей Portala ${index + 1}`}
                  width={580}
                  height={460}
                  className={styles.image}
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
        </button>
      </div>
    </section>
  );
}