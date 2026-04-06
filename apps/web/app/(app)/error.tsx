'use client';
import { useEffect } from 'react';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2 style={{ marginBottom: '1rem', color: 'var(--text)' }}>Something went wrong</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error.message}</p>
      <button
        onClick={reset}
        style={{
          padding: '0.5rem 1rem',
          background: 'var(--primary)',
          color: '#fff',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </div>
  );
}
