import styles from "./Trust.module.css";

const trustItems = [
  {
    iconId: "icon-image-11-Vectorized",
    title: "Реальні фото",
    text: "Жодних сюрпризів — тільки фактичний вигляд товару.",
  },
  {
    iconId: "icon-image-12-Vectorized",
    title: "Наявність",
    text: "Актуальні позиції, які готові до відправки.",
  },
  {
    iconId: "icon-image-9-Vectorized",
    title: "Вигідні ціни",
    text: "Вигідні ціни та спеціальні акційні пропозиції.",
  },
  {
    iconId: "icon-image-10-Vectorized",
    title: "Підтримка",
    text: "Швидко відповідаємо та супроводжуємо на всіх етапах вибору.",
  },
];

export default function Trust() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Чому нам довіряють?</h2>

        <p className={styles.subtitle}>
          Обирайте двері без ризиків: бачите реальні фото, перевіряєте наявність
          <br />
          і отримуєте найкращу ціну — з швидкою підтримкою на кожному етапі
        </p>

        <div className={styles.cards}>
          {trustItems.map((item, index) => (
            <article key={index} className={styles.card}>
              <div className={styles.iconWrap}>
                <svg className={styles.icon}>
                  <use href={`/icons/symbol-defs.svg#${item.iconId}`} />
                </svg>
              </div>

              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardText}>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}