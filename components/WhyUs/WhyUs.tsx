import styles from './WhyUs.module.css';

const benefits = [
  {
    title: 'Фотографії реальних товарів',
    text: 'Перегляньте реальні фотографії кожних дверей, щоб бути впевненими у відповідності.',
  },
  {
    title: 'Актуальна інформація про наявність на складі',
    text: 'Переглядайте актуальні залишки безпосередньо зі складу, щоб бути впевненими у наявності.',
  },
  {
    title: 'Привабливі акційні ціни',
    text: 'Скористайтеся спеціальними цінами на вибрані дверні залишки.',
  },
];

export default function WhyUs() {
  return (
    <section className={styles.whyUs}>
      <div className={styles.container}>
        <h2 className={styles.title}>Чому варто обрати нас?</h2>

        <p className={styles.subtitle}>
          Отримуйте переваги від реальних фотографій товарів, наявності на
          складі, акційних цін та швидкої підтримки клієнтів. Насолоджуйтесь
          зручними покупками.
        </p>

        <div className={styles.list}>
          {benefits.map((item, index) => (
            <div key={index} className={styles.item}>
              <div className={styles.icon}>
                <span className={styles.check}>✓</span>
              </div>

              <div className={styles.content}>
                <h3 className={styles.itemTitle}>{item.title}</h3>
                <p className={styles.itemText}>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}