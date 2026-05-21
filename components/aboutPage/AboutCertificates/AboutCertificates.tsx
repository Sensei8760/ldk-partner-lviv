import Image from "next/image";
import styles from "./AboutCertificates.module.css";

const certificates = Array.from({ length: 4 }, (_, index) => ({
  src: `/images/Certificate/certificate-${index + 1}.jpg`,
  alt: `Сертифікат відповідності Portala ${index + 1}`,
}));

export default function AboutCertificates() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <p className={styles.label}>Якість</p>

        <h2 className={styles.title}>Сучасний підхід та сертифікація</h2>

        <p className={styles.text}>
          Беремо участь у профільних виставках InterBuildExpo, KyivBuild та
          EuroBuild, щоб впроваджувати актуальні технології, стежити за
          трендами ринку та постійно вдосконалювати виробництво.
        </p>

        <div className={styles.grid}>
          {certificates.map((certificate) => (
            <div className={styles.card} key={certificate.src}>
              <Image
                src={certificate.src}
                alt={certificate.alt}
                width={300}
                height={420}
                className={styles.image}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}