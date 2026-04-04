import Link from 'next/link';

export default function GlobalNotFound() {
  return (
    <main
      style={{
        minHeight: '60vh',
        display: 'grid',
        placeItems: 'center',
        padding: '40px 20px',
        background: '#f6f6f6',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '700px',
          background: '#fff',
          border: '1px solid #e5e5e5',
          borderRadius: '18px',
          padding: '32px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            margin: '0 0 8px',
            fontSize: '14px',
            fontWeight: 700,
            color: '#0a9b43',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          404
        </p>

        <h1
          style={{
            margin: '0 0 14px',
            fontSize: '34px',
            color: '#111',
          }}
        >
          Сторінку не знайдено
        </h1>

        <p
          style={{
            margin: '0 0 24px',
            fontSize: '17px',
            lineHeight: 1.6,
            color: '#555',
          }}
        >
          Можливо, посилання застаріло або сторінка була переміщена.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/"
            style={{
              textDecoration: 'none',
              borderRadius: '12px',
              padding: '14px 18px',
              background: '#0a9b43',
              color: '#fff',
              fontWeight: 700,
            }}
          >
            На головну
          </Link>

          <Link
            href="/catalog"
            style={{
              textDecoration: 'none',
              borderRadius: '12px',
              padding: '14px 18px',
              background: '#fff',
              color: '#111',
              border: '1px solid #d8d8d8',
              fontWeight: 700,
            }}
          >
            У каталог
          </Link>
        </div>
      </div>
    </main>
  );
}