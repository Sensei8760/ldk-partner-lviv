import Hero from '@/components/hero/Hero';
import WhyUs from '@/components/WhyUs/WhyUs';
import AboutUs from '@/components/AboutUs/AboutUs';

export default function HomePage() {
  return (
    <main>
      <Hero />
      <AboutUs />
      <WhyUs />
    </main>
  );
}