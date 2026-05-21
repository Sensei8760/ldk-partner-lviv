import styles from "./AboutAdvantages.module.css";

const advantages = [
  {
    number: "01",
    title: "Сучасний дизайн",
  },
  {
    number: "02",
    title: "Якісні матеріали",
  },
  {
    number: "03",
    title: "Власне виробництво",
  },
  {
    number: "04",
    title: "Індивідуальний підхід",
  },
];

export default function AboutAdvantages() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {advantages.map((item) => (
          <div className={styles.item} key={item.number}>
            <p className={styles.number}>{item.number}</p>
            <h2 className={styles.title}>{item.title}</h2>
          </div>
        ))}
      </div>
    </section>
  );
}