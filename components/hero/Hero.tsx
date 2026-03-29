import styles from './Hero.module.css';
import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.top}>
        <div className={styles.left}>
          <h1>
            Ознайомтеся з <br />
            дверними залишками
          </h1>
        </div>

        <div className={styles.right}>
          <p>
            Перегляньте наш каталог та оберіть з різноманітних дверних
            залишків, які є на нашому складі у Львові. Знайдіть ідеальні
            двері для вашого проекту.
          </p>

          <Link href="/catalog" className={styles.button}>
            Переглянути каталог
          </Link>
        </div>
      </div>

      <div className={styles.imageWrapper}>
        <Image
          src="/images/door-hero.jpg"
          alt="Двері"
          fill
          priority
          className={styles.image}
        />
      </div>
    </section>
  );
}