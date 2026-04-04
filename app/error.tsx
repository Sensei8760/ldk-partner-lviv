'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
          maxWidth: '640px',
          background: '#fff',
          border: '1px solid #e5e5e5',
          borderRadius: '18px',
          padding: '28px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            margin: '0 0 12px',
            fontSize: '32px',
            color: '#111',
          }}
        >
          Щось пішло не так
        </h1>

        <p
          style={{
            margin: '0 0 20px',
            fontSize: '17px',
            lineHeight: 1.6,
            color: '#555',
          }}
        >
          Сталася помилка під час завантаження сторінки. Спробуйте оновити її ще раз.
        </p>

        <button
          type="button"
          onClick={reset}
          style={{
            border: 'none',
            borderRadius: '12px',
            padding: '14px 18px',
            background: '#0a9b43',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Спробувати ще раз
        </button>
      </div>
    </main>
  );
}