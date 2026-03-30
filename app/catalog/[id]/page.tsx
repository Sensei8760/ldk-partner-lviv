import Image from 'next/image';
import { notFound } from 'next/navigation';
import styles from './ProductPage.module.css';

const products = [
  {
    id: 'door-1',
    title: 'Міжкімнатні двері "Doors" Smart - модель - C067',
    price: 3064,
    image: '/images/doors/door-1.jpg',
    description:
      'Якісні міжкімнатні двері для сучасного інтер’єру. Відрізняються стильним дизайном, надійною конструкцією та гармонійно поєднуються з різними варіантами оздоблення приміщення.',
    characteristics: [
      { label: 'Тип', value: 'Міжкімнатні' },
      { label: 'Модель', value: 'C067' },
      { label: 'Матеріал', value: 'МДФ' },
      { label: 'Колір', value: 'Сірий дуб' },
      { label: 'Покриття', value: 'Плівка ПВХ' },
      { label: 'Розмір', value: '860 × 2050 мм' },
      { label: 'Тип відкривання', value: 'Універсальний' },
      { label: 'Стан', value: 'Нові' },
    ],
  },
  {
    id: 'door-2',
    title: 'Міжкімнатні двері "Doors" Smart - модель - C068',
    price: 3250,
    image: '/images/doors/door-1.jpg',
    description:
      'Сучасні двері з лаконічним дизайном для квартири або будинку. Добре підходять для житлових кімнат та офісних приміщень.',
    characteristics: [
      { label: 'Тип', value: 'Міжкімнатні' },
      { label: 'Модель', value: 'C068' },
      { label: 'Матеріал', value: 'МДФ' },
      { label: 'Колір', value: 'Світлий дуб' },
      { label: 'Покриття', value: 'Екошпон' },
      { label: 'Розмір', value: '860 × 2050 мм' },
      { label: 'Тип відкривання', value: 'Праве' },
      { label: 'Стан', value: 'Нові' },
    ],
  },
  {
    id: 'door-3',
    title: 'Міжкімнатні двері "Doors" Smart - модель - C069',
    price: 3390,
    image: '/images/doors/door-1.jpg',
    description:
      'Практичні та естетичні двері для сучасного інтер’єру. Мають акуратне оздоблення та зручні для щоденного використання.',
    characteristics: [
      { label: 'Тип', value: 'Міжкімнатні' },
      { label: 'Модель', value: 'C069' },
      { label: 'Матеріал', value: 'МДФ' },
      { label: 'Колір', value: 'Графіт' },
      { label: 'Покриття', value: 'ПВХ' },
      { label: 'Розмір', value: '860 × 2050 мм' },
      { label: 'Тип відкривання', value: 'Ліве' },
      { label: 'Стан', value: 'Нові' },
    ],
  },
];

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;

  const product = products.find((item) => item.id === id);

  if (!product) {
    notFound();
  }

  return (
    <main className={styles.productPage}>
      <div className={styles.container}>
        <div className={styles.layout}>
          <div className={styles.imageBlock}>
            <div className={styles.imageWrapper}>
              <Image
                src={product.image}
                alt={product.title}
                fill
                className={styles.image}
                priority
              />
            </div>
          </div>

          <div className={styles.infoBlock}>
            <h1 className={styles.title}>{product.title}</h1>

            <p className={styles.price}>
              {product.price} <span>грн</span>
            </p>

            <p className={styles.description}>{product.description}</p>

            <div className={styles.characteristics}>
              <h2 className={styles.characteristicsTitle}>Характеристики</h2>

              <ul className={styles.characteristicsList}>
                {product.characteristics.map((item) => (
                  <li key={item.label} className={styles.characteristicItem}>
                    <span className={styles.characteristicLabel}>
                      {item.label}:
                    </span>{' '}
                    <span className={styles.characteristicValue}>
                      {item.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}