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
  title: 'LDK Partner Lviv',
  description: 'Виробництво та продаж сучасних міжкімнатних та вхідних дверей.',
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
        <Header />
        <main>{children}
          <ScrollToTopBtn />
        </main>
        <Footer />
      </body>
    </html>
  );
}