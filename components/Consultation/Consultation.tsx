import Link from "next/link";
import styles from "./Consultation.module.css";

const consultationItems = [
  "Відповідаємо протягом 5 хвилин",
  "Безкоштовна консультація",
  "Без зобов’язань",
];

export default function Consultation() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>
          Підберемо ідеальні двері
          <br />
          під ваш інтер’єр за 10 хвилин
        </h2>

        <p className={styles.subtitle}>
          Допоможемо обрати модель, перевіримо наявність і запропонуємо найкращу
          ціну
        </p>

        <Link href="/contacts" className={styles.button}>
          <span>Отримати консультацію</span>
          <span className={styles.arrow} aria-hidden="true">
            →
          </span>
        </Link>

        <ul className={styles.list}>
          {consultationItems.map((item) => (
            <li key={item} className={styles.listItem}>
              <svg className={styles.checkIcon} aria-hidden="true">
  <use href="/icons/symbol-defs.svg?v=2#icon-untitled" />
</svg>

              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}