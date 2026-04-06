export default function AppLoading() {
  return (
    <div style={{ padding: '2rem' }}>
      <div
        style={{
          height: '2rem',
          width: '60%',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--surface-strong)',
          marginBottom: '1rem',
          animation: 'shimmer 1.5s infinite',
        }}
      />
      <div
        style={{
          height: '1rem',
          width: '40%',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--surface-strong)',
          animation: 'shimmer 1.5s infinite',
        }}
      />
    </div>
  );
}
