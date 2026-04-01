import type { Metadata } from 'next';
import './globals.css';

import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';

export const metadata: Metadata = {
  title: 'SITE-DOORS | Двері преміум якості',
  description: 'Виробництво та продаж сучасних міжкімнатних та вхідних дверей.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}