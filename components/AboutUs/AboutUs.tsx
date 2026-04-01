import Image from "next/image";
import styles from "./AboutUs.module.css";

export default function AboutUs() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h2 className={styles.title}>Про нас</h2>

          <p className={styles.text}>
            Ми допомагаємо обрати двері, які ідеально
            <br />
            доповнять ваш інтер’єр.
            <br />
            Багаторічний досвід роботи у Львові дозволяє нам
            <br />
            пропонувати перевірені рішення, які поєднують
            <br />
            якість, функціональність і сучасний дизайн.
          </p>
        </div>

        <div className={styles.imageWrap}>
          <Image
            src="/images/image-about-us.jpg"
            alt="Інтер’єр із дверима"
            className={styles.image}
            width={432}
            height={566}
            priority={false}
          />
        </div>
      </div>
    </section>
  );
}