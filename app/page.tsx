import type { Metadata } from 'next';
import Hero from '@/components/hero/Hero';
import AboutUs from '@/components/AboutUs/AboutUs';
import Trust from '@/components/Trust/Trust';
import Consultation from '@/components/Consultation/Consultation';
import Contacts from '@/components/Contacts/Contacts';

export const metadata: Metadata = {
  title: 'Вхідні та міжкімнатні двері у Львові',
  description:
    'LDK Partner Львів — каталог вхідних та міжкімнатних дверей. Двері в наявності, консультація, підбір моделі та допомога з вибором.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Вхідні та міжкімнатні двері у Львові',
    description:
      'Каталог моделей дверей у Львові. Оберіть двері для квартири, будинку або інтер’єру.',
    url: '/',
    images: [
      {
        url: '/images/image-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Вхідні та міжкімнатні двері у Львові',
      },
    ],
  },
};

export default function HomePage() {
  return (
    <main>
      <Hero />
      <AboutUs />
      <Trust />
      <Consultation />
      <Contacts />
    </main>
  );
}