import Image from 'next/image';
import styles from './AboutUs.module.css';

export default function AboutUs() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h2 className={styles.title}>Про нас</h2>

          <div className={styles.textBlock}>
            <p className={styles.text}>
              LDK Partner забезпечує повний цикл робіт із дверними рішеннями у
              Львові. Ми беремо на себе підбір, постачання, монтаж і сервісний
              супровід, щоб ви отримали готовий результат без зайвих витрат часу
              та складної координації.
            </p>

            <p className={styles.text}>
              Працюємо з вхідними, міжкімнатними, технічними та протипожежними
              дверима. Підбираємо рішення, що поєднують надійність,
              функціональність і сучасний дизайн для житлових і комерційних
              просторів.
            </p>

            <p className={styles.text}>
              Завдяки досвіду та злагодженим процесам забезпечуємо стабільну
              якість, дотримання термінів і комфортну співпрацю на кожному етапі
              реалізації проєкту.
            </p>
          </div>
        </div>

        <div className={styles.imageWrap}>
          <Image
            src="/images/image-about-us.jpg"
            alt="Коридор з установленими дверима"
            className={styles.image}
            fill
            sizes="(max-width: 900px) 100vw, 560px"
          />
        </div>
      </div>
    </section>
  );
}