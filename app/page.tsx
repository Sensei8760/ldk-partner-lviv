import Hero from '@/components/hero/Hero';
import AboutUs from '@/components/AboutUs/AboutUs';
import Trust from '@/components/Trust/Trust';
import Consultation from "@/components/Consultation/Consultation";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <AboutUs />
      <Trust />
      <Consultation />
    </main>
  );
}