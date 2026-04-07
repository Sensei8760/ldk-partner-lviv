import Image from "next/image";
import Link from "next/link";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.imageLayer} aria-hidden="true">
          <Image
            src="/images/image-hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className={styles.backgroundImage}
          />
        </div>

        <div className={styles.content}>
          <h1 className={styles.title}>Двері для вашого простору</h1>

          <p className={styles.text}>
            Каталог моделей, які вже є в наявності.
            <br />
            Оберіть і встановлюйте без очікування.
          </p>

          <div className={styles.actions}>
            <Link href="/catalog" className={styles.primaryButton}>
              Обрати двері в каталозі
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}