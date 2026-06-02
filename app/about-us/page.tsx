import type { Metadata } from "next";
import AboutPageHero from "../../components/aboutPage/AboutPageHero/AboutPageHero";

import AboutDecision from "../../components/aboutPage/AboutDecision/AboutDecision";
import AboutPortfolio from "../../components/aboutPage/AboutPortfolio/AboutPortfolio";
import AboutCertificates from "../../components/aboutPage/AboutCertificates/AboutCertificates";

export const metadata: Metadata = {
  title: "Про нас | Portala — виробництво дверей",
  description:
    "Portala — виробництво вхідних та міжкімнатних дверей. Якісні матеріали, сучасний дизайн, індивідуальне виготовлення та контроль кожної деталі.",
  alternates: {
    canonical: "/about-us",
  },
  openGraph: {
    title: "Про нас | Portala",
    description:
      "Виробництво дверей, де поєднуються інженерна досконалість, якість і сучасний дизайн.",
    url: "/about-us",
    images: ["/images/about-us-1.jpg"],
  },
};

export default function AboutUsPage() {
  return (
    <>
      <AboutPageHero />
      <AboutPortfolio />
          <AboutDecision />
          <AboutCertificates />
    </>
  );
}