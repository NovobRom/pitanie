'use client';

// Last-resort boundary: catches errors thrown in the root layout itself, where
// the normal error.tsx (which renders *inside* the layout) can't help. Because
// it replaces the root layout, it must render its own <html>/<body> and can't
// rely on the app's CSS variables — so styles are inlined to stay self-sufficient.

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global app error:', error);
  }, [error]);

  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#f7f1e9',
          color: '#1c1917',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: '360px',
            width: '100%',
            textAlign: 'center',
            background: '#ffffff',
            borderRadius: '28px',
            padding: '32px',
            boxShadow: '0 6px 16px -4px rgb(64 47 25 / 0.08)',
            border: '1px solid #ece4d8',
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 8px' }}>
            Что-то пошло не так
          </h2>
          <p style={{ fontSize: '14px', color: '#6b6259', margin: '0 0 24px' }}>
            Приложение столкнулось с критической ошибкой. Попробуйте перезагрузить.
          </p>
          <button
            onClick={reset}
            style={{
              width: '100%',
              border: 'none',
              borderRadius: '16px',
              background: '#f97316',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '15px',
              padding: '12px',
              cursor: 'pointer',
            }}
          >
            Перезагрузить
          </button>
        </div>
      </body>
    </html>
  );
}
