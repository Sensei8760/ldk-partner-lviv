import Image from 'next/image';
import Link from 'next/link';
import styles from './not-found.module.css';

const actions = [
    {
        href: '/',
        iconId: 'icon-home',
        title: 'На головну',
        text: 'Поверніться на головну сторінку сайту',
    },
    {
        href: '/catalog',
        iconId: 'icon-catalog-404',
        title: 'Каталог дверей',
        text: 'Перегляньте весь асортимент наших дверей',
    },
    {
        href: '/contacts',
        iconId: 'icon-phone-404',
        title: "Зв’язатися з нами",
        text: 'Ми допоможемо підібрати ідеальні двері для вас',
    },
];

export default function NotFound() {
    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.inner}>
                    <div className={styles.imageLayer}>
                        <Image
                            src="/images/doors-404.jpg"
                            alt="404 сторінку не знайдено"
                            fill
                            priority
                            className={styles.backgroundImage}
                        />
                    </div>

                    <div className={styles.content}>
                        <h1 className={styles.code}>404</h1>

                        <h2 className={styles.title}>
                            Сторінку не знайдено
                        </h2>

                        <p className={styles.text}>
                            Схоже, ви потрапили не туди.
                            <br />
                            Але не хвилюйтеся — ми допоможемо знайти правильні двері.
                        </p>

                        <Link href="/" className={styles.primaryButton}>
                            <span>Повернутися на головну</span>

                            <span className={styles.buttonArrow} aria-hidden="true">
                                <svg width="24" height="24">
                                    <use href="/icons/symbol-defs.svg?v=6#icon-fi-rs-arrow-right" />
                                </svg>
                            </span>
                        </Link>
                    </div>
                </div>
            </section>

            <section className={styles.actionsSection}>
                <h3 className={styles.actionsTitle}>
                    Що ви можете зробити?
                </h3>

                <div className={styles.actionsGrid}>
                    {actions.map((action) => (
                        <Link
                            key={action.title}
                            href={action.href}
                            className={styles.actionCard}
                        >
                            <span className={styles.actionIconWrap} aria-hidden="true">
                                <svg className={styles.actionIcon}>
                                    <use href={`/icons/symbol-defs.svg#${action.iconId}`} />
                                </svg>
                            </span>

                            <span className={styles.actionCardTitle}>
                                {action.title}
                            </span>

                            <span className={styles.actionCardText}>
                                {action.text}
                            </span>

                            <span className={styles.actionArrow} aria-hidden="true">
                                <svg width="18" height="18">
                                    <use href="/icons/symbol-defs.svg?v=6#icon-fi-rs-arrow-right" />
                                </svg>
                            </span>
                        </Link>
                    ))}
                </div>
            </section>
        </main>
    );
}