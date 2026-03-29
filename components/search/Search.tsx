import styles from './Search.module.css';

const items = [
  {
    title: 'Колір',
    text: 'Будь ласка, вкажіть бажаний колір дверей.',
  },
  {
    title: 'Розмір',
    text: 'Будь ласка, виберіть необхідні розміри.',
  },
  {
    title: 'Обладнання',
    text: 'Будь ласка, виберіть необхідне обладнання.',
  },
  {
    title: 'Тип відкривання',
    text: 'Будь ласка, вкажіть напрямок відкривання.',
  },
];

export default function Search() {
  return (
    <section className={styles.search}>
      <div className={styles.container}>
        <h2 className={styles.title}>Уточнюйте пошук</h2>

        <p className={styles.subtitle}>
          Скористайтеся нашими фільтрами для сортування за кольором,
          розміром та характеристиками, щоб швидко знайти ідеальний
          залишок дверей.
        </p>

        <div className={styles.grid}>
          {items.map((item, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.icon}>✓</div>

              <div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardText}>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}