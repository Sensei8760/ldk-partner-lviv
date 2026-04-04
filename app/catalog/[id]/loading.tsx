export default function ProductLoading() {
  return (
    <main
      style={{
        minHeight: '60vh',
        display: 'grid',
        placeItems: 'center',
        padding: '40px 20px',
        background: '#f3f3f3',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#222',
          fontSize: '18px',
        }}
      >
        <span
          style={{
            width: '22px',
            height: '22px',
            border: '2px solid #d9d9d9',
            borderTopColor: '#0a9b43',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <span>Завантаження товару...</span>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}