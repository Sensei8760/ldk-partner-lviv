import Image from "next/image";
import styles from "./AboutDecision.module.css";

const images = [
  {
    src: "/images/decision-1.jpg",
    alt: "Будинок з дверима Portala",
  },
  {
    src: "/images/decision-2.jpg",
    alt: "Двері для забудовників",
  },
  {
    src: "/images/decision-3.jpg",
    alt: "Міжкімнатні двері Portala",
  },
  {
    src: "/images/decision-4.jpg",
    alt: "Комплексні рішення для будинків",
  },
];

export default function AboutDecision() {
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
              Закриваємо весь комплекс рішень по дверях: вхідні, міжкімнатні,
              технічні, протипожежні.
            </p>

            <p>
              Без пошуку кількох постачальників, зайвої логістики — усі процеси
              беремо на себе.
            </p>

            <p>
              LDK Partner — це єдина екосистема, де поєднані виробництво, сервіс
              і логістика для реалізації ваших проєктів.
            </p>
          </div>
        </div>

        <div className={styles.gallery}>
          {images.map((image) => (
            <div className={styles.imageBox} key={image.src}>
              <Image
                src={image.src}
                alt={image.alt}
                width={230}
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