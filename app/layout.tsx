import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import ScrollToTopBtn from '@/components/ScrollToTopBtn/ScrollToTopBtn';

import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
   verification: {
    google: '04QvHUW2T_ak7Gn3ZR3HTtzysiwTtrn5Q4FfxddGNhQ',
  },
  metadataBase: new URL('https://ldk-partner-lviv.vercel.app'),
  title: {
    default: 'LDK Partner Львів — вхідні та міжкімнатні двері',
    template: '%s | LDK Partner Львів',
  },
  description:
    'LDK Partner у Львові: вхідні та міжкімнатні двері в наявності, консультація, підбір моделі та допомога з вибором.',
  applicationName: 'LDK Partner Львів',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'uk_UA',
    url: '/',
    siteName: 'LDK Partner Львів',
    title: 'LDK Partner Львів — вхідні та міжкімнатні двері',
    description:
      'Каталог вхідних та міжкімнатних дверей у Львові. Допоможемо підібрати двері під ваш інтер’єр.',
    images: [
      {
        url: '/images/image-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'LDK Partner Львів — двері для вашого простору',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LDK Partner Львів — вхідні та міжкімнатні двері',
    description:
      'Каталог вхідних та міжкімнатних дверей у Львові. Допоможемо підібрати двері під ваш інтер’єр.',
    images: ['/images/image-hero.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${playfairDisplay.variable}`}
    >
      <body>
        <script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'LDK Partner Львів',
      alternateName: 'LDK Partner',
      url: 'https://ldk-partner-lviv.vercel.app',
    }).replace(/</g, '\\u003c'),
  }}
/>
        <Header />
        <main>
          {children}
          <ScrollToTopBtn />
        </main>
        <Footer />
      </body>
    </html>
  );
}